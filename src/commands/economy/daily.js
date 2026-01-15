import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"
import User from "../../database/schemas/User.js"

export default {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily reward"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    // Check cooldown
    const cooldown = await checkCooldown(odbc, "daily")
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

    // Calculate reward with streak
    const user = await client.economy.getUser(odbc)
    const lastDaily = user.lastDaily
    const now = new Date()

    let streak = user.dailyStreak || 0

    // Check if streak should continue (within 48 hours of last daily)
    if (lastDaily) {
      const hoursSince = (now - new Date(lastDaily)) / (1000 * 60 * 60)
      if (hoursSince > 48) {
        streak = 0 // Reset streak
      }
    }

    streak++
    const streakBonus = Math.min(streak * 50, 500) // Max 500 bonus
    const baseReward = randomInt(500, 1000)
    const totalReward = baseReward + streakBonus

    // Update user
    await User.findOneAndUpdate(
      { odbc },
      {
        $inc: { wallet: totalReward },
        $set: { dailyStreak: streak, lastDaily: now },
      },
    )

    await setCooldown(odbc, "daily")

    const embed = createTerminalEmbed({
      title: "DAILY REWARD CLAIMED",
      description: [
        `┌─ REWARD BREAKDOWN ────────┐`,
        `│ Base:   ${client.config.emojis.coin} ${formatNumber(baseReward)}`,
        `│ Streak: ${client.config.emojis.coin} +${formatNumber(streakBonus)}`,
        `│─────────────────────────────│`,
        `│ Total:  ${client.config.emojis.coin} ${formatNumber(totalReward)}`,
        `└───────────────────────────┘`,
        ``,
        `Current Streak: ${streak} days`,
      ].join("\n"),
      color: client.config.colors.success,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
