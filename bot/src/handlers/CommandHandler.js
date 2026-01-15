const { REST, Routes } = require("discord.js")
const fs = require("fs")
const path = require("path")
const Logger = require("../utils/Logger")

class CommandHandler {
  constructor(client) {
    this.client = client
  }

  async loadCommands() {
    const commandsPath = path.join(__dirname, "..", "commands")
    const categories = fs.readdirSync(commandsPath)
    const commands = []

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category)
      if (!fs.statSync(categoryPath).isDirectory()) continue

      const commandFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith(".js"))

      for (const file of commandFiles) {
        try {
          const CommandClass = require(path.join(categoryPath, file))
          const command = new CommandClass(this.client)

          if (!command.name) {
            Logger.warn(`Command ${file} is missing a name`)
            continue
          }

          this.client.commands.set(command.name, command)
          commands.push(command.toJSON())
          Logger.debug(`Loaded command: ${command.name}`)
        } catch (error) {
          Logger.error(`Failed to load command ${file}: ${error.message}`)
        }
      }
    }

    Logger.info(`Loaded ${this.client.commands.size} commands`)
    await this.registerCommands(commands)
  }

  async registerCommands(commands) {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

    try {
      Logger.info("Registering slash commands...")

      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })

      Logger.success(`Registered ${commands.length} slash commands`)
    } catch (error) {
      Logger.error(`Failed to register commands: ${error.message}`)
    }
  }
}

module.exports = CommandHandler
