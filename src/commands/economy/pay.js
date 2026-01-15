import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber } from "../../utils/helpers.js"

export default {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user")
    .addUserOption((opt) => opt.setName("user").setDescription("User to pay").setRequired(true))
    .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount to pay").setRequired(true).setMinValue(1)),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const target = interaction.options.getUser("user")
    const amount = interaction.options.getInteger("amount")

    if (target.id === odbc) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot pay yourself.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    if (target.bot) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot pay bots.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    try {
      await client.economy.transfer(odbc, target.id, amount)

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "PAYMENT SENT",
            description: [
              `┌─ TRANSACTION ─────────────┐`,
              `│ To:     ${target.username}`,
              `│ Amount: ${client.config.emojis.coin} ${formatNumber(amount)}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.success,
          }),
        ],
      })
    } catch (error) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "PAYMENT FAILED",
            description: error.message,
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }
  },
}
