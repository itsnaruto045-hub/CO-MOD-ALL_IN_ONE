import User from "../../database/schemas/User.js"
import Guild from "../../database/schemas/Guild.js"
import Transaction from "../../database/schemas/Transaction.js"

export class EconomyManager {
  constructor(client) {
    this.client = client
  }

  async getUser(odbc) {
    let user = await User.findOne({ odbc })
    if (!user) {
      user = await User.create({ odbc })
    }
    return user
  }

  async getGuild(guildId) {
    let guild = await Guild.findOne({ guildId })
    if (!guild) {
      guild = await Guild.create({ guildId })
    }
    return guild
  }

  async addMoney(odbc, amount, type = "wallet", source = "system") {
    const field = type === "bank" ? "bank" : "wallet"

    const user = await User.findOneAndUpdate(
      { odbc },
      {
        $inc: { [field]: amount, totalEarned: amount },
        $setOnInsert: { odbc },
      },
      { upsert: true, new: true },
    )

    await this.logTransaction(odbc, "cash", "earn", amount, source)

    return user
  }

  async removeMoney(odbc, amount, type = "wallet", source = "system") {
    const field = type === "bank" ? "bank" : "wallet"

    const user = await User.findOneAndUpdate(
      { odbc },
      { $inc: { [field]: -amount, totalSpent: amount } },
      { new: true },
    )

    await this.logTransaction(odbc, "cash", "spend", -amount, source)

    return user
  }

  async transfer(fromodbc, toodbc, amount) {
    const fromUser = await this.getUser(fromodbc)

    if (fromUser.wallet < amount) {
      throw new Error("Insufficient funds")
    }

    await User.findOneAndUpdate({ odbc: fromodbc }, { $inc: { wallet: -amount } })

    await User.findOneAndUpdate({ odbc: toodbc }, { $inc: { wallet: amount } }, { upsert: true })

    await this.logTransaction(fromodbc, "transfer", "send", -amount, `To ${toodbc}`, toodbc)
    await this.logTransaction(toodbc, "transfer", "receive", amount, `From ${fromodbc}`, fromodbc)
  }

  async deposit(odbc, amount) {
    const user = await this.getUser(odbc)

    if (user.wallet < amount) {
      throw new Error("Insufficient funds")
    }

    const spaceAvailable = user.bankLimit - user.bank
    const actualAmount = Math.min(amount, spaceAvailable)

    if (actualAmount <= 0) {
      throw new Error("Bank is full")
    }

    await User.findOneAndUpdate({ odbc }, { $inc: { wallet: -actualAmount, bank: actualAmount } })

    return actualAmount
  }

  async withdraw(odbc, amount) {
    const user = await this.getUser(odbc)

    if (user.bank < amount) {
      throw new Error("Insufficient bank balance")
    }

    await User.findOneAndUpdate({ odbc }, { $inc: { wallet: amount, bank: -amount } })

    return amount
  }

  async getBalance(odbc) {
    const user = await this.getUser(odbc)
    return {
      wallet: user.wallet,
      bank: user.bank,
      bankLimit: user.bankLimit,
      total: user.wallet + user.bank,
    }
  }

  async getLeaderboard(limit = 10) {
    return User.find({ frozenBalance: false }).sort({ wallet: -1 }).limit(limit).select("odbc wallet bank")
  }

  async isEconomyFrozen(guildId) {
    const guild = await this.getGuild(guildId)
    return guild.economy.frozen
  }

  async freezeEconomy(guildId, freeze = true) {
    await Guild.findOneAndUpdate({ guildId }, { $set: { "economy.frozen": freeze } })
  }

  async resetGuildEconomy(guildId) {
    // This resets all users in the guild - owner only
    // Implementation depends on how you track guild members
    console.log(`[ECO] Economy reset for guild ${guildId}`)
  }

  async logTransaction(odbc, type, action, amount, description, targetUser = null) {
    await Transaction.create({
      odbc,
      type,
      action,
      amount,
      description,
      toUser: targetUser,
      isOwnerAction: false,
    })
  }

  async ownerAddMoney(odbc, amount, ownerId, note = "") {
    await User.findOneAndUpdate({ odbc }, { $inc: { wallet: amount } }, { upsert: true })

    await Transaction.create({
      odbc,
      type: "owner_action",
      action: amount >= 0 ? "add" : "remove",
      amount,
      description: "Owner adjustment",
      isOwnerAction: true,
      ownerNote: note,
    })
  }

  async freezeUser(odbc, freeze = true) {
    await User.findOneAndUpdate({ odbc }, { $set: { frozenBalance: freeze } })
  }

  async flagUser(odbc, reason) {
    await User.findOneAndUpdate({ odbc }, { $set: { flagged: true, flagReason: reason } })
  }
}
