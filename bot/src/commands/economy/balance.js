const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class BalanceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      description: "Check your or another user's balance",
      category: "Economy",
      options: [
        {
          name: "user",
          description: "User to check balance of",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user
    const balance = await this.client.economyManager.getBalance(targetUser.id, interaction.guild?.id || "global")

    // Check privacy mode
    const userData = await this.client.economyManager.getUser(targetUser.id, interaction.guild?.id || "global")

    if (userData.settings?.privacyMode && targetUser.id !== interaction.user.id) {
      return interaction.reply({
        embeds: [SDFEmbed.error("This user has privacy mode enabled")],
        ephemeral: true,
      })
    }

    const embed = new SDFEmbed()
      .setTitle(`\`[ BALANCE ]\``)
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  User: ${targetUser.username.padEnd(20)}║
╠══════════════════════════════╣
║  Wallet: ${Helpers.formatNumber(balance.wallet).padEnd(18)}║
║  Bank:   ${Helpers.formatNumber(balance.bank).padEnd(18)}║
╠══════════════════════════════╣
║  Total:  ${Helpers.formatNumber(balance.total).padEnd(18)}║
╚══════════════════════════════╝
\`\`\``)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = BalanceCommand
