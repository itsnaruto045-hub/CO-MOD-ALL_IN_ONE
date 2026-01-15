const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  odId: { type: String, required: true },
  guildId: { type: String, required: true },
  type: {
    type: String,
    enum: ["credit", "debit", "deposit", "withdraw", "transfer", "game", "shop", "reward"],
    required: true,
  },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  reason: { type: String, required: true },
  balanceAfter: { type: Number },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
})

transactionSchema.index({ odId: 1, timestamp: -1 })
transactionSchema.index({ guildId: 1, timestamp: -1 })
transactionSchema.index({ timestamp: -1 })

module.exports = mongoose.model("Transaction", transactionSchema)
