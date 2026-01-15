const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")

class ResetEconomyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reset-economy",
      description: "Reset server economy (Owner only)",
      category: "Owner",
      options: [
        {
          name: "confirm",
          description: 'Type "CONFIRM" to reset',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      ownerOnly: true,
    })
  }

  async run(interaction) {
    const confirm = interaction.options.getString("confirm")

    if (confirm !== "CONFIRM") {
      return interaction.reply({
        embeds: [SDFEmbed.error('Type "CONFIRM" to reset the server economy')],
        ephemeral: true,
      })
    }

    const guildId = interaction.guild?.id || "global"
    await this.client.economyManager.resetServerEconomy(guildId)

    const embed = new SDFEmbed()
      .setTitle("`[ ECONOMY RESET ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║  SERVER ECONOMY WIPED        ║
║  All balances reset to 0     ║
║  All transactions cleared    ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0xff0000)

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}

module.exports = ResetEconomyCommand
