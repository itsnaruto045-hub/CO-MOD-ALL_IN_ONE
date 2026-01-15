import { Client, GatewayIntentBits, Collection, Partials } from "discord.js"
import { config } from "dotenv"
import { connectDatabase } from "./database/connection.js"
import { loadCommands } from "./handlers/commandHandler.js"
import { loadEvents } from "./handlers/eventHandler.js"
import { AntiNukeManager } from "./systems/antinuke/antiNukeManager.js"
import { EconomyManager } from "./systems/economy/economyManager.js"
import { CryptoManager } from "./systems/crypto/cryptoManager.js"
import { GameManager } from "./systems/games/gameManager.js"
import { MusicManager } from "./systems/music/musicManager.js"
import ModerationManager from "./systems/moderation/moderationManager.js"
import AutoModManager from "./systems/automod/autoModManager.js"
import WelcomeManager from "./systems/welcome/welcomeManager.js"
import TicketManager from "./systems/tickets/ticketManager.js"

config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

// Collections
client.commands = new Collection()
client.cooldowns = new Collection()
client.activeGames = new Collection()

client.economy = new EconomyManager(client)
client.crypto = new CryptoManager(client)
client.antinuke = new AntiNukeManager(client)
client.games = new GameManager(client)
client.music = new MusicManager(client)
client.moderation = new ModerationManager(client)
client.automod = new AutoModManager(client)
client.welcome = new WelcomeManager(client)
client.tickets = new TicketManager(client)

// Config
client.config = {
  ownerId: process.env.OWNER_ID,
  colors: {
    primary: 0x00ff00,
    error: 0xff0000,
    warning: 0xffff00,
    success: 0x00ff00,
    info: 0x00ffff,
  },
  emojis: {
    loading: "⟨⟩",
    success: "✓",
    error: "✗",
    coin: "◈",
    crypto: "₿",
  },
}

async function start() {
  try {
    console.log("[SDF] Initializing bot...")

    await connectDatabase()
    console.log("[SDF] Database connected")

    await loadCommands(client)
    console.log("[SDF] Commands loaded")

    await loadEvents(client)
    console.log("[SDF] Events loaded")

    client.once("ready", async () => {
      await client.music.initialize()
      console.log("[SDF] Music system initialized")
    })

    await client.login(process.env.DISCORD_TOKEN)
  } catch (error) {
    console.error("[SDF] Failed to start:", error)
    process.exit(1)
  }
}

start()

export { client }
