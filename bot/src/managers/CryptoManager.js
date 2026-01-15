const CryptoWallet = require("../database/models/CryptoWallet")
const CryptoTransaction = require("../database/models/CryptoTransaction")
const { CRYPTO } = require("../utils/Constants")
const Logger = require("../utils/Logger")

class CryptoManager {
  constructor(client) {
    this.client = client
    this.prices = new Map()
    this.updatePrices()
    setInterval(() => this.updatePrices(), 60000) // Update every minute
  }

  async updatePrices() {
    // Simulated prices - in production, use a real API
    this.prices.set("BTC", 65000 + Math.random() * 5000)
    this.prices.set("ETH", 3500 + Math.random() * 500)
    this.prices.set("LTC", 80 + Math.random() * 20)
    this.prices.set("DOGE", 0.08 + Math.random() * 0.02)
    this.prices.set("USDT", 1)
  }

  getPrice(symbol) {
    return this.prices.get(symbol) || 0
  }

  async getWallet(userId) {
    let wallet = await CryptoWallet.findOne({ odId: userId })
    if (!wallet) {
      wallet = await CryptoWallet.create({
        odId: userId,
        balances: {
          BTC: 0,
          ETH: 0,
          LTC: 0,
          DOGE: 0,
          USDT: 0,
        },
      })
    }
    return wallet
  }

  async getBalance(userId, symbol = null) {
    const wallet = await this.getWallet(userId)
    if (symbol) {
      return wallet.balances.get(symbol) || 0
    }
    return Object.fromEntries(wallet.balances)
  }

  async addCrypto(userId, symbol, amount, reason = "Unknown") {
    if (this.client.cryptoPaused) {
      throw new Error("Crypto system is currently paused")
    }

    if (!CRYPTO.SUPPORTED.includes(symbol)) {
      throw new Error("Unsupported cryptocurrency")
    }

    const wallet = await this.getWallet(userId)
    const currentBalance = wallet.balances.get(symbol) || 0
    wallet.balances.set(symbol, currentBalance + amount)
    await wallet.save()

    await this.logTransaction({
      odId: userId,
      type: "credit",
      symbol,
      amount,
      reason,
      priceAtTime: this.getPrice(symbol),
    })

    return wallet
  }

  async removeCrypto(userId, symbol, amount, reason = "Unknown") {
    if (this.client.cryptoPaused) {
      throw new Error("Crypto system is currently paused")
    }

    const wallet = await this.getWallet(userId)
    const currentBalance = wallet.balances.get(symbol) || 0

    if (currentBalance < amount) {
      throw new Error(`Insufficient ${symbol} balance`)
    }

    wallet.balances.set(symbol, currentBalance - amount)
    await wallet.save()

    await this.logTransaction({
      odId: userId,
      type: "debit",
      symbol,
      amount,
      reason,
      priceAtTime: this.getPrice(symbol),
    })

    return wallet
  }

  async tip(fromUserId, toUserId, symbol, amount) {
    if (this.client.cryptoPaused) {
      throw new Error("Crypto system is currently paused")
    }

    if (amount < CRYPTO.MIN_TIP[symbol]) {
      throw new Error(`Minimum tip amount is ${CRYPTO.MIN_TIP[symbol]} ${symbol}`)
    }

    await this.removeCrypto(fromUserId, symbol, amount, `Tip to ${toUserId}`)
    await this.addCrypto(toUserId, symbol, amount, `Tip from ${fromUserId}`)

    return { success: true }
  }

  async rain(fromUserId, symbol, totalAmount, recipients) {
    if (this.client.cryptoPaused) {
      throw new Error("Crypto system is currently paused")
    }

    if (recipients.length < CRYPTO.RAIN_MIN_USERS) {
      throw new Error(`Minimum ${CRYPTO.RAIN_MIN_USERS} recipients required`)
    }

    if (recipients.length > CRYPTO.RAIN_MAX_USERS) {
      throw new Error(`Maximum ${CRYPTO.RAIN_MAX_USERS} recipients allowed`)
    }

    const amountPerUser = totalAmount / recipients.length

    await this.removeCrypto(fromUserId, symbol, totalAmount, "Crypto rain")

    for (const recipientId of recipients) {
      await this.addCrypto(recipientId, symbol, amountPerUser, `Rain from ${fromUserId}`)
    }

    return { amountPerUser, recipientCount: recipients.length }
  }

  async logTransaction(data) {
    try {
      await CryptoTransaction.create({
        ...data,
        timestamp: new Date(),
      })
    } catch (error) {
      Logger.error(`Failed to log crypto transaction: ${error.message}`)
    }
  }

  async getPortfolioValue(userId) {
    const wallet = await this.getWallet(userId)
    let totalValue = 0

    for (const [symbol, balance] of wallet.balances) {
      totalValue += balance * this.getPrice(symbol)
    }

    return totalValue
  }
}

module.exports = CryptoManager
