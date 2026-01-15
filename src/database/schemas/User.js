import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    odbc: { type: String, required: true, unique: true },
    odbc: String,

    // Global Economy
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankLimit: { type: Number, default: 10000 },

    // Stats
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalGambled: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 },
    totalLost: { type: Number, default: 0 },

    // Cooldowns
    cooldowns: {
      daily: Date,
      weekly: Date,
      monthly: Date,
      work: Date,
      hunt: Date,
      beg: Date,
      crime: Date,
      rob: Date,
    },

    // Crypto Wallets
    crypto: {
      BTC: { type: Number, default: 0 },
      ETH: { type: Number, default: 0 },
      LTC: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      DOGE: { type: Number, default: 0 },
    },

    depositAddresses: {
      BTC: String,
      ETH: String,
      LTC: String,
      USDT: String,
      DOGE: String,
    },

    // Inventory
    inventory: [
      {
        itemId: String,
        quantity: { type: Number, default: 1 },
        purchasedAt: { type: Date, default: Date.now },
      },
    ],

    // Game Stats
    gameStats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
    },

    // Streaks
    dailyStreak: { type: Number, default: 0 },
    lastDaily: Date,

    // Privacy & Settings
    balancePrivate: { type: Boolean, default: false },

    // Anti-cheat
    flagged: { type: Boolean, default: false },
    flagReason: String,
    frozenBalance: { type: Boolean, default: false },

    // Alt detection
    linkedAccounts: [String],
    ipHash: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

userSchema.index({ odbc: 1 })
userSchema.index({ wallet: -1 })
userSchema.index({ "crypto.BTC": -1 })

export default mongoose.model("User", userSchema)
