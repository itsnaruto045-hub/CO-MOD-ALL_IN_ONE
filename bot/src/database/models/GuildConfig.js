const mongoose = require("mongoose")

const guildConfigSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: "%" },

    // Economy settings
    economy: {
      enabled: { type: Boolean, default: true },
      currencyName: { type: String, default: "coins" },
      currencySymbol: { type: String, default: "💰" },
      multiplier: { type: Number, default: 1 },
    },

    // Anti-nuke settings
    antiNuke: {
      enabled: { type: Boolean, default: false },
      whitelistedUsers: [String],
      whitelistedRoles: [String],
      quarantineRoleId: { type: String },
      logChannelId: { type: String },
      lockdownActive: { type: Boolean, default: false },
      settings: {
        antiBan: { type: Boolean, default: true },
        antiKick: { type: Boolean, default: true },
        antiChannelDelete: { type: Boolean, default: true },
        antiRoleDelete: { type: Boolean, default: true },
        antiWebhook: { type: Boolean, default: true },
      },
    },

    // Music settings
    music: {
      enabled: { type: Boolean, default: true },
      djRoleId: { type: String },
      defaultVolume: { type: Number, default: 80 },
      maxQueueSize: { type: Number, default: 500 },
      announceTrack: { type: Boolean, default: true },
    },

    // Logging settings
    logging: {
      enabled: { type: Boolean, default: false },
      modLogChannelId: { type: String },
      messageLogChannelId: { type: String },
      memberLogChannelId: { type: String },
    },

    // Auto-mod settings
    autoMod: {
      enabled: { type: Boolean, default: false },
      antiSpam: { type: Boolean, default: false },
      antiLink: { type: Boolean, default: false },
      antiInvite: { type: Boolean, default: false },
      maxMentions: { type: Number, default: 10 },
      maxEmojis: { type: Number, default: 20 },
      exemptRoles: [String],
      exemptChannels: [String],
    },

    // Reaction roles
    reactionRoles: [
      {
        messageId: String,
        channelId: String,
        reactions: [
          {
            emoji: String,
            roleId: String,
          },
        ],
      },
    ],

    // Auto roles
    autoRoles: {
      memberRoles: [String],
      botRoles: [String],
    },

    // Welcome/Leave messages
    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String },
      message: { type: String, default: "Welcome {user} to {server}!" },
      embedEnabled: { type: Boolean, default: true },
    },

    leave: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String },
      message: { type: String, default: "{user} has left the server." },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("GuildConfig", guildConfigSchema)
