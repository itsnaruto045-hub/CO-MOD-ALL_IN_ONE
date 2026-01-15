import mongoose from "mongoose"

const guildSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },

    // Economy Settings
    economy: {
      enabled: { type: Boolean, default: true },
      frozen: { type: Boolean, default: false },
      currencyName: { type: String, default: "coins" },
      currencySymbol: { type: String, default: "◈" },
      multiplier: { type: Number, default: 1 },
    },

    // Crypto Settings
    crypto: {
      enabled: { type: Boolean, default: true },
      paused: { type: Boolean, default: false },
      allowedCoins: { type: [String], default: ["BTC", "ETH", "LTC", "USDT", "DOGE"] },
    },

    // Anti-Nuke Settings
    antinuke: {
      enabled: { type: Boolean, default: false },
      logChannel: String,
      whitelistedUsers: [String],
      whitelistedRoles: [String],
      quarantineRole: String,

      thresholds: {
        banLimit: { type: Number, default: 3 },
        kickLimit: { type: Number, default: 3 },
        channelDeleteLimit: { type: Number, default: 2 },
        roleDeleteLimit: { type: Number, default: 2 },
        webhookCreateLimit: { type: Number, default: 2 },
      },

      timeWindow: { type: Number, default: 10000 }, // 10 seconds

      actions: {
        stripPermissions: { type: Boolean, default: true },
        quarantine: { type: Boolean, default: true },
        ban: { type: Boolean, default: false },
      },
    },

    // Music Settings
    music: {
      djRole: String,
      defaultVolume: { type: Number, default: 50 },
      announceChannel: String,
      twentyFourSeven: { type: Boolean, default: false },
    },

    // Moderation Settings
    moderation: {
      logChannel: String,
      muteRole: String,
    },

    // Automation
    autorole: {
      enabled: { type: Boolean, default: false },
      roles: [String],
      botRoles: [String],
    },

    reactionRoles: [
      {
        messageId: String,
        channelId: String,
        emoji: String,
        roleId: String,
      },
    ],

    // Logging
    logging: {
      enabled: { type: Boolean, default: false },
      channels: {
        messages: String,
        members: String,
        moderation: String,
        voice: String,
        server: String,
      },
    },

    // Shop
    shop: [
      {
        id: String,
        name: String,
        description: String,
        price: Number,
        type: { type: String, enum: ["role", "perk", "item"] },
        roleId: String,
        stock: { type: Number, default: -1 }, // -1 = unlimited
      },
    ],

    // Server backup for restore
    backup: {
      channels: [Object],
      roles: [Object],
      lastBackup: Date,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

guildSchema.index({ guildId: 1 })

export default mongoose.model("Guild", guildSchema)
