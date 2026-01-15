const mongoose = require("mongoose")

const cryptoTransactionSchema = new mongoose.Schema({
  odId: { type: String, required: true },
  type: {
    type: String,
    enum: ["credit", "debit", "tip", "rain", "deposit", "withdraw"],
    required: true,
  },
  symbol: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  priceAtTime: { type: Number },
  txHash: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "confirmed",
  },
  timestamp: { type: Date, default: Date.now },
})

cryptoTransactionSchema.index({ odId: 1, timestamp: -1 })
cryptoTransactionSchema.index({ symbol: 1, timestamp: -1 })

module.exports = mongoose.model("CryptoTransaction", cryptoTransactionSchema)
