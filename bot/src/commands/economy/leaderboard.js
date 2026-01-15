const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")

class LeaderboardCommand extends Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      description: "View the richest users",
      category: "Economy",
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const leaderboard = await this.client.economyManager.getLeaderboard(interaction.guild?.id || "global", 10)

    if (leaderboard.length === 0) {
      return interaction.reply({
        embeds: [SDFEmbed.warning("No users found")],
        ephemeral: true,
      })
    }

    let description = "```ansi\n\u001b[0;32m╔══════════════════════════════════════╗\n"
    description += "║           TOP 10 RICHEST             ║\n"
    description += "╠══════════════════════════════════════╣\n"

    for (const entry of leaderboard) {
      const user = await this.client.users.fetch(entry.odId).catch(() => null)
      const username = user ? user.username.slice(0, 12) : "Unknown"
      const rank = String(entry.rank).padStart(2, " ")
      const total = Helpers.formatNumber(entry.total).padEnd(12)
      description += `║ ${rank}. ${username.padEnd(12)} ${total} ║\n`
    }

    description += "╚══════════════════════════════════════╝\n```"

    const embed = new SDFEmbed().setTitle("`[ LEADERBOARD ]`").setDescription(description).setColor(0xffd700)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = LeaderboardCommand
