import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

export default {
  data: new SlashCommandBuilder().setName("weekly").setDescription("Claim your weekly reward"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const cooldown = await checkCooldown(odbc, "weekly")
    if (!cooldown.ready) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "COOLDOWN ACTIVE",
            description: `Come back in ${formatDuration(cooldown.remaining)}`,
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const reward = randomInt(5000, 10000)

    await client.economy.addMoney(odbc, reward, "wallet", "weekly")
    await setCooldown(odbc, "weekly")

    const embed = createTerminalEmbed({
      title: "WEEKLY REWARD CLAIMED",
      description: [
        `┌─ REWARD ──────────────────┐`,
        `│ ${client.config.emojis.coin} ${formatNumber(reward)}`,
        `└───────────────────────────┘`,
      ].join("\n"),
      color: client.config.colors.success,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
