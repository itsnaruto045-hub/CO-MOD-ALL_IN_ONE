const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class WithdrawCommand extends Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      description: "Withdraw money from your bank",
      category: "Economy",
      options: [
        {
          name: "amount",
          description: 'Amount to withdraw (or "all")',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const amountStr = interaction.options.getString("amount")
    const user = await this.client.economyManager.getUser(interaction.user.id, interaction.guild?.id || "global")

    let amount
    if (amountStr.toLowerCase() === "all" || amountStr.toLowerCase() === "max") {
      amount = user.bank
    } else {
      amount = Number.parseInt(amountStr)
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          embeds: [SDFEmbed.error("Please enter a valid amount")],
          ephemeral: true,
        })
      }
    }

    if (amount > user.bank) {
      return interaction.reply({
        embeds: [SDFEmbed.error("Insufficient bank balance")],
        ephemeral: true,
      })
    }

    try {
      await this.client.economyManager.withdraw(interaction.user.id, interaction.guild?.id || "global", amount)

      const updatedBalance = await this.client.economyManager.getBalance(
        interaction.user.id,
        interaction.guild?.id || "global",
      )

      const embed = new SDFEmbed()
        .setTitle(`\`[ WITHDRAW SUCCESSFUL ]\``)
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Withdrawn: ${Helpers.formatNumber(amount).padEnd(16)}║
╠══════════════════════════════╣
║  New Wallet: ${Helpers.formatNumber(updatedBalance.wallet).padEnd(15)}║
║  New Bank:   ${Helpers.formatNumber(updatedBalance.bank).padEnd(15)}║
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

module.exports = WithdrawCommand
