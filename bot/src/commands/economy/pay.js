const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class PayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: "Pay money to another user",
      category: "Economy",
      options: [
        {
          name: "user",
          description: "User to pay",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Amount to pay",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 1,
        },
      ],
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const target = interaction.options.getUser("user")
    const amount = interaction.options.getInteger("amount")
    const guildId = interaction.guild?.id || "global"

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot pay yourself")],
        ephemeral: true,
      })
    }

    if (target.bot) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot pay bots")],
        ephemeral: true,
      })
    }

    try {
      await this.client.economyManager.transfer(interaction.user.id, target.id, guildId, amount)

      const embed = new SDFEmbed()
        .setTitle("`[ PAYMENT SENT ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  TRANSACTION COMPLETE        ║
╠══════════════════════════════╣
║  To: ${target.username.slice(0, 22).padEnd(23)}║
║  Amount: ${Helpers.formatNumber(amount).padEnd(19)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      await interaction.reply({
        embeds: [SDFEmbed.error(error.message)],
        ephemeral: true,
      })
    }
  }
}

module.exports = PayCommand
