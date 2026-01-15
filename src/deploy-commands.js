import { REST, Routes } from "discord.js"
import { config } from "dotenv"
import { readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const commands = []

async function loadCommands() {
  const commandsPath = join(__dirname, "commands")
  const categories = readdirSync(commandsPath)

  for (const category of categories) {
    const categoryPath = join(commandsPath, category)
    const commandFiles = readdirSync(categoryPath).filter((f) => f.endsWith(".js"))

    for (const file of commandFiles) {
      const { default: command } = await import(`./commands/${category}/${file}`)
      if (command?.data) {
        commands.push(command.data.toJSON())
      }
    }
  }
}

async function deploy() {
  await loadCommands()

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

  try {
    console.log(`[SDF] Deploying ${commands.length} commands...`)

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })

    console.log("[SDF] Commands deployed successfully")
  } catch (error) {
    console.error("[SDF] Deploy error:", error)
  }
}

deploy()
