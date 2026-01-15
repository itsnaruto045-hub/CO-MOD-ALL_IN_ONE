import User from "../../database/schemas/User.js"
import Transaction from "../../database/schemas/Transaction.js"
import crypto from "crypto"

const SUPPORTED_COINS = ["BTC", "ETH", "LTC", "USDT", "DOGE"]

const COIN_INFO = {
  BTC: { name: "Bitcoin", symbol: "₿", decimals: 8, color: 0xf7931a },
  ETH: { name: "Ethereum", symbol: "Ξ", decimals: 8, color: 0x627eea },
  LTC: { name: "Litecoin", symbol: "Ł", decimals: 8, color: 0xbfbbbb },
  USDT: { name: "Tether", symbol: "₮", decimals: 6, color: 0x26a17b },
  DOGE: { name: "Dogecoin", symbol: "Ð", decimals: 8, color: 0xc2a633 },
}

export class CryptoManager {
  constructor(client) {
    this.client = client
    this.prices = new Map()
    this.priceCache = new Map()
    this.rateLimits = new Map()
    this.paused = false
  }

  // Price fetching from CoinGecko
  async fetchPrices() {
    try {
      const ids = "bitcoin,ethereum,litecoin,tether,dogecoin"
      const url = `${process.env.CRYPTO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd`

      const response = await fetch(url)
      const data = await response.json()

      this.prices.set("BTC", data.bitcoin?.usd || 0)
      this.prices.set("ETH", data.ethereum?.usd || 0)
      this.prices.set("LTC", data.litecoin?.usd || 0)
      this.prices.set("USDT", data.tether?.usd || 1)
      this.prices.set("DOGE", data.dogecoin?.usd || 0)

      return this.prices
    } catch (error) {
      console.error("[CRYPTO] Failed to fetch prices:", error)
      return this.prices
    }
  }

  getPrice(coin) {
    return this.prices.get(coin.toUpperCase()) || 0
  }

  getCoinInfo(coin) {
    return COIN_INFO[coin.toUpperCase()]
  }

  isValidCoin(coin) {
    return SUPPORTED_COINS.includes(coin.toUpperCase())
  }

  // Balance operations
  async getBalance(odbc, coin) {
    const user = await User.findOne({ odbc })
    if (!user) return 0
    return user.crypto?.[coin.toUpperCase()] || 0
  }

  async getAllBalances(odbc) {
    const user = await User.findOne({ odbc })
    if (!user) return {}
    return user.crypto || {}
  }

  async addCrypto(odbc, coin, amount) {
    const coinUpper = coin.toUpperCase()
    if (!this.isValidCoin(coinUpper)) throw new Error("Invalid coin")

    await User.findOneAndUpdate(
      { odbc },
      { $inc: { [`crypto.${coinUpper}`]: amount }, $setOnInsert: { odbc } },
      { upsert: true },
    )

    await this.logTransaction(odbc, "crypto", "receive", amount, coinUpper)
  }

  async removeCrypto(odbc, coin, amount) {
    const coinUpper = coin.toUpperCase()
    if (!this.isValidCoin(coinUpper)) throw new Error("Invalid coin")

    const balance = await this.getBalance(odbc, coinUpper)
    if (balance < amount) throw new Error("Insufficient balance")

    await User.findOneAndUpdate({ odbc }, { $inc: { [`crypto.${coinUpper}`]: -amount } })

    await this.logTransaction(odbc, "crypto", "spend", -amount, coinUpper)
  }

  // Tip crypto to another user
  async tip(fromodbc, toodbc, coin, amount) {
    const coinUpper = coin.toUpperCase()

    if (this.paused) throw new Error("Crypto system is paused")
    if (!this.isValidCoin(coinUpper)) throw new Error("Invalid coin")
    if (amount <= 0) throw new Error("Amount must be positive")

    // Rate limit check
    if (this.isRateLimited(fromodbc)) {
      throw new Error("Rate limited. Please wait.")
    }

    const fromBalance = await this.getBalance(fromodbc, coinUpper)
    if (fromBalance < amount) throw new Error("Insufficient balance")

    // Execute transfer
    await User.findOneAndUpdate({ odbc: fromodbc }, { $inc: { [`crypto.${coinUpper}`]: -amount } })

    await User.findOneAndUpdate(
      { odbc: toodbc },
      { $inc: { [`crypto.${coinUpper}`]: amount }, $setOnInsert: { odbc: toodbc } },
      { upsert: true },
    )

    // Log transactions
    await Transaction.create({
      odbc: fromodbc,
      type: "crypto",
      action: "tip_send",
      amount: -amount,
      currency: coinUpper,
      toUser: toodbc,
    })

    await Transaction.create({
      odbc: toodbc,
      type: "crypto",
      action: "tip_receive",
      amount,
      currency: coinUpper,
      fromUser: fromodbc,
    })

    this.setRateLimit(fromodbc)
  }

  // Rain crypto in a channel
  async rain(fromodbc, coin, totalAmount, recipients) {
    const coinUpper = coin.toUpperCase()

    if (this.paused) throw new Error("Crypto system is paused")
    if (!this.isValidCoin(coinUpper)) throw new Error("Invalid coin")
    if (recipients.length === 0) throw new Error("No recipients")

    const fromBalance = await this.getBalance(fromodbc, coinUpper)
    if (fromBalance < totalAmount) throw new Error("Insufficient balance")

    const amountPerUser = totalAmount / recipients.length

    // Remove from sender
    await User.findOneAndUpdate({ odbc: fromodbc }, { $inc: { [`crypto.${coinUpper}`]: -totalAmount } })

    // Add to each recipient
    for (const recipientId of recipients) {
      await User.findOneAndUpdate(
        { odbc: recipientId },
        { $inc: { [`crypto.${coinUpper}`]: amountPerUser }, $setOnInsert: { odbc: recipientId } },
        { upsert: true },
      )

      await Transaction.create({
        odbc: recipientId,
        type: "crypto",
        action: "rain_receive",
        amount: amountPerUser,
        currency: coinUpper,
        fromUser: fromodbc,
      })
    }

    await Transaction.create({
      odbc: fromodbc,
      type: "crypto",
      action: "rain_send",
      amount: -totalAmount,
      currency: coinUpper,
      description: `Rain to ${recipients.length} users`,
    })

    return { amountPerUser, recipientCount: recipients.length }
  }

  // Generate deposit address (simulated)
  async generateDepositAddress(odbc, coin) {
    const coinUpper = coin.toUpperCase()
    if (!this.isValidCoin(coinUpper)) throw new Error("Invalid coin")

    // Generate a unique address (in production, use actual wallet generation)
    const address = this.generateFakeAddress(coinUpper)

    await User.findOneAndUpdate(
      { odbc },
      { $set: { [`depositAddresses.${coinUpper}`]: address }, $setOnInsert: { odbc } },
      { upsert: true },
    )

    return address
  }

  generateFakeAddress(coin) {
    const prefixes = {
      BTC: "bc1",
      ETH: "0x",
      LTC: "ltc1",
      USDT: "0x",
      DOGE: "D",
    }

    const prefix = prefixes[coin] || ""
    const randomPart = crypto.randomBytes(20).toString("hex")

    return prefix + randomPart.slice(0, coin === "ETH" || coin === "USDT" ? 40 : 32)
  }

  async getDepositAddress(odbc, coin) {
    const coinUpper = coin.toUpperCase()
    const user = await User.findOne({ odbc })

    if (user?.depositAddresses?.[coinUpper]) {
      return user.depositAddresses[coinUpper]
    }

    return this.generateDepositAddress(odbc, coinUpper)
  }

  // Rate limiting
  isRateLimited(odbc) {
    const lastAction = this.rateLimits.get(odbc)
    if (!lastAction) return false
    return Date.now() - lastAction < 3000 // 3 second cooldown
  }

  setRateLimit(odbc) {
    this.rateLimits.set(odbc, Date.now())
  }

  // Pause/unpause crypto system (owner only)
  pause() {
    this.paused = true
  }

  unpause() {
    this.paused = false
  }

  isPaused() {
    return this.paused
  }

  // Logging
  async logTransaction(odbc, type, action, amount, currency) {
    await Transaction.create({
      odbc,
      type,
      action,
      amount,
      currency,
    })
  }

  // Get transaction history
  async getTransactionHistory(odbc, limit = 10) {
    return Transaction.find({ odbc, type: "crypto" }).sort({ createdAt: -1 }).limit(limit)
  }

  // Format crypto amount for display
  formatAmount(amount, coin) {
    const info = this.getCoinInfo(coin)
    const decimals = info?.decimals || 8
    return amount.toFixed(decimals)
  }
}
