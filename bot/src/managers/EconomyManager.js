const User = require("../database/models/User")
const Transaction = require("../database/models/Transaction")
const { ECONOMY } = require("../utils/Constants")
const Logger = require("../utils/Logger")

class EconomyManager {
  constructor(client) {
    this.client = client
  }

  async getUser(userId, guildId = "global") {
    let user = await User.findOne({ userId, guildId })
    if (!user) {
      user = await User.create({
        userId,
        guildId,
        wallet: ECONOMY.STARTING_BALANCE,
        bank: 0,
      })
    }
    return user
  }

  async getBalance(userId, guildId = "global") {
    const user = await this.getUser(userId, guildId)
    return {
      wallet: user.wallet,
      bank: user.bank,
      total: user.wallet + user.bank,
    }
  }

  async addMoney(userId, guildId, amount, type = "wallet", reason = "Unknown") {
    if (this.client.economyFrozen && !this.client.isOwner(userId)) {
      throw new Error("Economy is currently frozen")
    }

    const user = await this.getUser(userId, guildId)

    if (type === "wallet") {
      user.wallet = Math.min(user.wallet + amount, ECONOMY.MAX_WALLET)
    } else {
      user.bank = Math.min(user.bank + amount, ECONOMY.MAX_BANK)
    }

    await user.save()

    await this.logTransaction({
      userId,
      guildId,
      type: "credit",
      amount,
      reason,
      balanceAfter: type === "wallet" ? user.wallet : user.bank,
    })

    return user
  }

  async removeMoney(userId, guildId, amount, type = "wallet", reason = "Unknown") {
    if (this.client.economyFrozen && !this.client.isOwner(userId)) {
      throw new Error("Economy is currently frozen")
    }

    const user = await this.getUser(userId, guildId)

    if (type === "wallet") {
      if (user.wallet < amount) throw new Error("Insufficient wallet balance")
      user.wallet -= amount
    } else {
      if (user.bank < amount) throw new Error("Insufficient bank balance")
      user.bank -= amount
    }

    await user.save()

    await this.logTransaction({
      userId,
      guildId,
      type: "debit",
      amount,
      reason,
      balanceAfter: type === "wallet" ? user.wallet : user.bank,
    })

    return user
  }

  async transfer(fromUserId, toUserId, guildId, amount) {
    if (this.client.economyFrozen) {
      throw new Error("Economy is currently frozen")
    }

    const fromUser = await this.getUser(fromUserId, guildId)

    if (fromUser.wallet < amount) {
      throw new Error("Insufficient balance")
    }

    await this.removeMoney(fromUserId, guildId, amount, "wallet", `Transfer to ${toUserId}`)
    await this.addMoney(toUserId, guildId, amount, "wallet", `Transfer from ${fromUserId}`)

    return { fromUser: await this.getUser(fromUserId, guildId), toUser: await this.getUser(toUserId, guildId) }
  }

  async deposit(userId, guildId, amount) {
    const user = await this.getUser(userId, guildId)

    if (user.wallet < amount) {
      throw new Error("Insufficient wallet balance")
    }

    const fee = Math.floor(amount * ECONOMY.DEPOSIT_FEE)
    const depositAmount = amount - fee

    user.wallet -= amount
    user.bank = Math.min(user.bank + depositAmount, ECONOMY.MAX_BANK)
    await user.save()

    await this.logTransaction({
      userId,
      guildId,
      type: "deposit",
      amount: depositAmount,
      fee,
      reason: "Bank deposit",
    })

    return user
  }

  async withdraw(userId, guildId, amount) {
    const user = await this.getUser(userId, guildId)

    if (user.bank < amount) {
      throw new Error("Insufficient bank balance")
    }

    const fee = Math.floor(amount * ECONOMY.WITHDRAW_FEE)
    const withdrawAmount = amount - fee

    user.bank -= amount
    user.wallet = Math.min(user.wallet + withdrawAmount, ECONOMY.MAX_WALLET)
    await user.save()

    await this.logTransaction({
      userId,
      guildId,
      type: "withdraw",
      amount: withdrawAmount,
      fee,
      reason: "Bank withdrawal",
    })

    return user
  }

  async getLeaderboard(guildId, limit = 10) {
    const users = await User.find({ guildId })
      .sort({ $expr: { $add: ["$wallet", "$bank"] } })
      .limit(limit)

    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.userId,
      wallet: u.wallet,
      bank: u.bank,
      total: u.wallet + u.bank,
    }))
  }

  async logTransaction(data) {
    try {
      await Transaction.create({
        ...data,
        timestamp: new Date(),
      })
    } catch (error) {
      Logger.error(`Failed to log transaction: ${error.message}`)
    }
  }

  async resetServerEconomy(guildId) {
    await User.deleteMany({ guildId })
    await Transaction.deleteMany({ guildId })
    Logger.info(`Economy reset for guild ${guildId}`)
  }

  async detectAlt(userId, guildId) {
    // Check for suspicious patterns
    const recentTransactions = await Transaction.find({
      guildId,
      timestamp: { $gte: new Date(Date.now() - 3600000) },
    })

    const userTransactions = recentTransactions.filter((t) => t.userId === userId || t.reason?.includes(userId))

    if (userTransactions.length > ECONOMY.ALT_DETECTION_THRESHOLD) {
      return true
    }

    return false
  }
}

module.exports = EconomyManager
