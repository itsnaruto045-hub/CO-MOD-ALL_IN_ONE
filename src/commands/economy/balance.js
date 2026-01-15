import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed, createProgressBar } from "../../utils/embed.js"
import { formatNumber } from "../../utils/helpers.js"

export default {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your or another user's balance")
    .addUserOption((opt) => opt.setName("user").setDescription("User to check balance of")),

  async execute(interaction, client) {
    const targetUser = interaction.options.getUser("user") || interaction.user
    const balance = await client.economy.getBalance(targetUser.id)

    // Check privacy
    if (targetUser.id !== interaction.user.id) {
      const userData = await client.economy.getUser(targetUser.id)
      if (userData.balancePrivate) {
        return interaction.reply({
          embeds: [
            createTerminalEmbed({
              title: "PRIVATE",
              description: "This user has their balance set to private.",
              color: client.config.colors.error,
            }),
          ],
          ephemeral: true,
        })
      }
    }

    const bankProgress = createProgressBar(balance.bank, balance.bankLimit, 15)

    const embed = createTerminalEmbed({
      title: `BALANCE // ${targetUser.username.toUpperCase()}`,
      description: [
        `┌─ WALLET ──────────────────┐`,
        `│ ${client.config.emojis.coin} ${formatNumber(balance.wallet).padEnd(20)}│`,
        `└───────────────────────────┘`,
        ``,
        `┌─ BANK ────────────────────┐`,
        `│ ${client.config.emojis.coin} ${formatNumber(balance.bank)} / ${formatNumber(balance.bankLimit)}`,
        `│ ${bankProgress}`,
        `└───────────────────────────┘`,
        ``,
        `┌─ NET WORTH ───────────────┐`,
        `│ ${client.config.emojis.coin} ${formatNumber(balance.total).padEnd(20)}│`,
        `└───────────────────────────┘`,
      ].join("\n"),
      color: client.config.colors.primary,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
