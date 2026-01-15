require("dotenv").config()
const SDFClient = require("./structures/Client")
const Logger = require("./utils/Logger")

const client = new SDFClient()

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.warn("Received SIGINT, shutting down...")
  await client.destroy()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  Logger.warn("Received SIGTERM, shutting down...")
  await client.destroy()
  process.exit(0)
})

process.on("unhandledRejection", (error) => {
  Logger.error(`Unhandled rejection: ${error.message}`)
  console.error(error)
})

process.on("uncaughtException", (error) => {
  Logger.error(`Uncaught exception: ${error.message}`)
  console.error(error)
  process.exit(1)
})

client.start()
