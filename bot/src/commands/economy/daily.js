const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class DailyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "Claim your daily reward",
      category: "Economy",
      cooldown: 0, // Handled internally
    })
  }

  async run(interaction) {
    const userId = interaction.user.id
    const guildId = interaction.guild?.id || "global"

    const user = await this.client.economyManager.getUser(userId, guildId)

    // Check cooldown
    const lastClaim = user.streaks?.daily?.lastClaim
    if (lastClaim) {
      const timeSince = Date.now() - new Date(lastClaim).getTime()
      if (timeSince < COOLDOWNS.DAILY) {
        const remaining = COOLDOWNS.DAILY - timeSince
        return interaction.reply({
          embeds: [SDFEmbed.warning(`You can claim again in ${Helpers.formatDuration(remaining)}`)],
          ephemeral: true,
        })
      }
    }

    // Calculate streak
    let streak = user.streaks?.daily?.count || 0
    if (lastClaim) {
      const hoursSince = (Date.now() - new Date(lastClaim).getTime()) / 3600000
      if (hoursSince <= 48) {
        streak++
      } else {
        streak = 1
      }
    } else {
      streak = 1
    }

    // Calculate reward with streak bonus
    const baseAmount = ECONOMY.DAILY_AMOUNT
    const streakBonus = Math.min(streak * 50, 500)
    const totalAmount = baseAmount + streakBonus

    // Update user
    user.wallet += totalAmount
    user.streaks = user.streaks || {}
    user.streaks.daily = {
      count: streak,
      lastClaim: new Date(),
    }
    await user.save()

    const embed = new SDFEmbed()
      .setTitle(`\`[ DAILY REWARD ]\``)
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║       REWARD CLAIMED!        ║
╠══════════════════════════════╣
║  Base:    +${Helpers.formatNumber(baseAmount).padEnd(16)}║
║  Streak:  +${Helpers.formatNumber(streakBonus).padEnd(16)}║
╠══════════════════════════════╣
║  Total:   +${Helpers.formatNumber(totalAmount).padEnd(16)}║
║  Streak:  ${String(streak).padEnd(17)}days ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00ff00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = DailyCommand
