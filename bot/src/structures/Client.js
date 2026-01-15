const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js")
const { Shoukaku, Connectors } = require("shoukaku")
const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")
const Logger = require("../utils/Logger")
const CommandHandler = require("../handlers/CommandHandler")
const EventHandler = require("../handlers/EventHandler")
const AntiNukeManager = require("../managers/AntiNukeManager")
const EconomyManager = require("../managers/EconomyManager")
const CryptoManager = require("../managers/CryptoManager")
const CooldownManager = require("../managers/CooldownManager")
const GuildConfig = require("../database/models/GuildConfig")

const LavalinkNodes = [
  {
    name: "Main",
    url: `${process.env.LAVALINK_HOST || "localhost"}:${process.env.LAVALINK_PORT || 2333}`,
    auth: process.env.LAVALINK_PASSWORD || "youshallnotpass",
  },
]

class SDFClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
      allowedMentions: { parse: ["users", "roles"], repliedUser: true },
    })

    // Collections
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.guildConfigs = new Collection()
    this.activeGames = new Collection()
    this.musicQueues = new Collection()

    // Managers
    this.cooldownManager = new CooldownManager(this)
    this.economyManager = new EconomyManager(this)
    this.cryptoManager = new CryptoManager(this)
    this.antiNukeManager = new AntiNukeManager(this)

    // Config
    this.config = {
      ownerId: process.env.OWNER_ID,
      defaultPrefix: "%",
      embedColor: 0x00ff00,
      errorColor: 0xff0000,
      successColor: 0x00ff00,
      warningColor: 0xffaa00,
    }

    // Economy state
    this.economyFrozen = false
    this.cryptoPaused = false
  }

  async connectDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      Logger.success("Connected to MongoDB")
    } catch (error) {
      Logger.error(`MongoDB connection failed: ${error.message}`)
      process.exit(1)
    }
  }

  async initShoukaku() {
    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), LavalinkNodes, {
      moveOnDisconnect: true,
      resumable: true,
      resumableTimeout: 30,
      reconnectTries: 3,
      restTimeout: 60000,
    })

    this.shoukaku.on("ready", (name) => Logger.success(`Lavalink node ${name} connected`))
    this.shoukaku.on("error", (name, error) => Logger.error(`Lavalink node ${name} error: ${error.message}`))
    this.shoukaku.on("close", (name, code, reason) => Logger.warn(`Lavalink node ${name} closed: ${code} - ${reason}`))
    this.shoukaku.on("disconnect", (name, count) =>
      Logger.warn(`Lavalink node ${name} disconnected, ${count} players affected`),
    )
  }

  async loadGuildConfigs() {
    const configs = await GuildConfig.find({})
    for (const config of configs) {
      this.guildConfigs.set(config.guildId, config)
    }
    Logger.info(`Loaded ${configs.length} guild configurations`)
  }

  async getGuildConfig(guildId) {
    if (this.guildConfigs.has(guildId)) {
      return this.guildConfigs.get(guildId)
    }

    let config = await GuildConfig.findOne({ guildId })
    if (!config) {
      config = await GuildConfig.create({ guildId })
    }
    this.guildConfigs.set(guildId, config)
    return config
  }

  isOwner(userId) {
    return userId === this.config.ownerId
  }

  async start() {
    try {
      Logger.info("Starting SDF Bot...")

      await this.connectDatabase()
      await this.loadGuildConfigs()

      const commandHandler = new CommandHandler(this)
      const eventHandler = new EventHandler(this)

      await commandHandler.loadCommands()
      await eventHandler.loadEvents()

      await this.login(process.env.DISCORD_TOKEN)

      // Initialize Shoukaku after login
      this.once("ready", async () => {
        await this.initShoukaku()
        Logger.success(`${this.user.tag} is online!`)
      })
    } catch (error) {
      Logger.error(`Failed to start bot: ${error.message}`)
      console.error(error)
      process.exit(1)
    }
  }
}

module.exports = SDFClient
