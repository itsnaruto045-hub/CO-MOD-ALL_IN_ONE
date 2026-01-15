const mongoose = require("mongoose")

const cryptoWalletSchema = new mongoose.Schema(
  {
    odId: { type: String, required: true, unique: true },
    balances: {
      type: Map,
      of: Number,
      default: {
        BTC: 0,
        ETH: 0,
        LTC: 0,
        DOGE: 0,
        USDT: 0,
      },
    },
    depositAddresses: {
      type: Map,
      of: String,
      default: {},
    },
    withdrawAddresses: [
      {
        symbol: String,
        address: String,
        label: String,
        addedAt: Date,
      },
    ],
    settings: {
      twoFactorEnabled: { type: Boolean, default: false },
      withdrawalLimit: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("CryptoWallet", cryptoWalletSchema)
