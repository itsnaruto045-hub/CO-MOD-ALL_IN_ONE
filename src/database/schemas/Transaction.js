import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
  odbc: { type: String, required: true },
  odbc: String,
  guildId: String,

  type: {
    type: String,
    enum: ["cash", "crypto", "shop", "game", "transfer", "owner_action"],
    required: true,
  },

  action: String, // deposit, withdraw, earn, spend, win, lose, etc.

  amount: { type: Number, required: true },
  currency: { type: String, default: "cash" },

  fromUser: String,
  toUser: String,

  // For crypto
  txHash: String,
  address: String,

  // Metadata
  description: String,

  // Owner actions
  isOwnerAction: { type: Boolean, default: false },
  ownerNote: String,

  // Rollback support
  rolledBack: { type: Boolean, default: false },
  rollbackReason: String,

  createdAt: { type: Date, default: Date.now },
})

transactionSchema.index({ odbc: 1, createdAt: -1 })
transactionSchema.index({ type: 1 })
transactionSchema.index({ isOwnerAction: 1 })

export default mongoose.model("Transaction", transactionSchema)
