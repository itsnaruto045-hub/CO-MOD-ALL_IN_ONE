const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class RemoveMoneyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "remove-money",
      description: "Remove money from a user (Owner only)",
      category: "Owner",
      options: [
        {
          name: "user",
          description: "Target user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Amount to remove",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 1,
        },
        {
          name: "type",
          description: "Wallet or bank",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            { name: "wallet", value: "wallet" },
            { name: "bank", value: "bank" },
          ],
        },
      ],
      ownerOnly: true,
    })
  }

  async run(interaction) {
    const user = interaction.options.getUser("user")
    const amount = interaction.options.getInteger("amount")
    const type = interaction.options.getString("type") || "wallet"

    try {
      await this.client.economyManager.removeMoney(
        user.id,
        interaction.guild?.id || "global",
        amount,
        type,
        "Owner removal",
      )

      const embed = new SDFEmbed()
        .setTitle("`[ OWNER ACTION ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║  Removed ${Helpers.formatNumber(amount).padEnd(18)}║
║  From: ${user.username.padEnd(21)}║
║  Type: ${type.padEnd(21)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      await interaction.reply({
        embeds: [SDFEmbed.error(error.message)],
        ephemeral: true,
      })
    }
  }
}

module.exports = RemoveMoneyCommand
