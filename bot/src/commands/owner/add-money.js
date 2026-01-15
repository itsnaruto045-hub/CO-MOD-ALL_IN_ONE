const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class AddMoneyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "add-money",
      description: "Add money to a user (Owner only)",
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
          description: "Amount to add",
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

    await this.client.economyManager.addMoney(
      user.id,
      interaction.guild?.id || "global",
      amount,
      type,
      "Owner addition",
    )

    const embed = new SDFEmbed()
      .setTitle("`[ OWNER ACTION ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Added ${Helpers.formatNumber(amount).padEnd(20)}║
║  To: ${user.username.padEnd(23)}║
║  Type: ${type.padEnd(21)}║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0xffd700)

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }
}

module.exports = AddMoneyCommand
