require("dotenv").config()
const { ShardingManager } = require("discord.js")
const path = require("path")
const Logger = require("./utils/Logger")

const manager = new ShardingManager(path.join(__dirname, "bot.js"), {
  token: process.env.DISCORD_TOKEN,
  totalShards: "auto",
  respawn: true,
})

manager.on("shardCreate", (shard) => {
  Logger.info(`Shard ${shard.id} launched`)

  shard.on("ready", () => {
    Logger.success(`Shard ${shard.id} ready`)
  })

  shard.on("disconnect", () => {
    Logger.warn(`Shard ${shard.id} disconnected`)
  })

  shard.on("error", (error) => {
    Logger.error(`Shard ${shard.id} error: ${error.message}`)
  })
})

manager.spawn({ timeout: 60000 }).catch((error) => {
  Logger.error(`Failed to spawn shards: ${error.message}`)
  process.exit(1)
})
