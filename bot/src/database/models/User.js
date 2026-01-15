const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    odId: { type: String, required: true },
    guildId: { type: String, required: true, default: "global" },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    bankCapacity: { type: Number, default: 10000 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streaks: {
      daily: { count: { type: Number, default: 0 }, lastClaim: Date },
      weekly: { count: { type: Number, default: 0 }, lastClaim: Date },
      monthly: { count: { type: Number, default: 0 }, lastClaim: Date },
    },
    stats: {
      commandsUsed: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      totalLost: { type: Number, default: 0 },
    },
    inventory: [
      {
        itemId: String,
        quantity: Number,
        purchasedAt: Date,
      },
    ],
    achievements: [String],
    settings: {
      privacyMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },
    flags: {
      banned: { type: Boolean, default: false },
      banReason: String,
      altAccount: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

userSchema.index({ odId: 1, guildId: 1 }, { unique: true })
userSchema.index({ wallet: -1 })
userSchema.index({ bank: -1 })

module.exports = mongoose.model("User", userSchema)
