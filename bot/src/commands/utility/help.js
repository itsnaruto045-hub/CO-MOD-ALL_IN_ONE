const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "View all commands or get help for a specific command",
      category: "Utility",
      options: [
        {
          name: "command",
          description: "Command to get help for",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const commandName = interaction.options.getString("command")

    if (commandName) {
      const command = this.client.commands.get(commandName.toLowerCase())

      if (!command) {
        return interaction.reply({
          embeds: [SDFEmbed.error("Command not found")],
          ephemeral: true,
        })
      }

      const embed = new SDFEmbed().setTitle(`\`[ /${command.name} ]\``).setDescription(`\`\`\`ansi
\u001b[0;32m${command.description}

Category: ${command.category}
Cooldown: ${command.cooldown / 1000}s
Owner Only: ${command.ownerOnly ? "Yes" : "No"}
\`\`\``)

      return interaction.reply({ embeds: [embed] })
    }

    // Group commands by category
    const categories = {}
    for (const [name, command] of this.client.commands) {
      if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) continue

      const category = command.category || "Misc"
      if (!categories[category]) categories[category] = []
      categories[category].push(command.name)
    }

    let description = "```ansi\n\u001b[0;32m╔══════════════════════════════════════╗\n"
    description += "║         % SDF >.. COMMANDS           ║\n"
    description += "╠══════════════════════════════════════╣\n"

    for (const [category, commands] of Object.entries(categories)) {
      description += `║ ${category.toUpperCase().padEnd(36)}║\n`
      description += `║   ${commands
        .map((c) => `/${c}`)
        .join(", ")
        .slice(0, 34)
        .padEnd(34)}║\n`
    }

    description += "╠══════════════════════════════════════╣\n"
    description += "║  Use /help <command> for details     ║\n"
    description += "╚══════════════════════════════════════╝\n```"

    const embed = new SDFEmbed().setTitle("`[ COMMAND LIST ]`").setDescription(description).setColor(0x00ff00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = HelpCommand
