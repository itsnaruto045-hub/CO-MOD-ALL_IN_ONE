import { readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function loadCommands(client) {
  const commandsPath = join(__dirname, "..", "commands")
  const categories = readdirSync(commandsPath)

  for (const category of categories) {
    const categoryPath = join(commandsPath, category)
    const commandFiles = readdirSync(categoryPath).filter((f) => f.endsWith(".js"))

    for (const file of commandFiles) {
      try {
        const { default: command } = await import(`../commands/${category}/${file}`)

        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command)
        }
      } catch (error) {
        console.error(`[CMD] Failed to load ${file}:`, error)
      }
    }
  }

  console.log(`[CMD] Loaded ${client.commands.size} commands`)
}
