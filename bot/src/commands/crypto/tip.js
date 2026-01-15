const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")
const { CRYPTO, COOLDOWNS } = require("../../utils/Constants")

class TipCommand extends Command {
  constructor(client) {
    super(client, {
      name: "tip",
      description: "Tip cryptocurrency to another user",
      category: "Crypto",
      options: [
        {
          name: "user",
          description: "User to tip",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Amount to tip",
          type: ApplicationCommandOptionType.Number,
          required: true,
          minValue: 0.00000001,
        },
        {
          name: "crypto",
          description: "Cryptocurrency to tip",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: CRYPTO.SUPPORTED.map((c) => ({ name: c, value: c })),
        },
      ],
      cooldown: COOLDOWNS.CRYPTO_TIP,
    })
  }

  async run(interaction) {
    const targetUser = interaction.options.getUser("user")
    const amount = interaction.options.getNumber("amount")
    const symbol = interaction.options.getString("crypto")

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot tip yourself")],
        ephemeral: true,
      })
    }

    if (targetUser.bot) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot tip bots")],
        ephemeral: true,
      })
    }

    try {
      await this.client.cryptoManager.tip(interaction.user.id, targetUser.id, symbol, amount)

      const embed = new SDFEmbed()
        .setTitle("`[ CRYPTO TIP ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  TIP SENT SUCCESSFULLY!      ║
╠══════════════════════════════╣
║  To: ${targetUser.username.slice(0, 20).padEnd(22)}║
║  Amount: ${amount} ${symbol.padEnd(15)}║
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

module.exports = TipCommand
