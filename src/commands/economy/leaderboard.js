import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber } from "../../utils/helpers.js"

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the richest users")
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Leaderboard type")
        .addChoices(
          { name: "Wallet", value: "wallet" },
          { name: "Bank", value: "bank" },
          { name: "Net Worth", value: "total" },
        ),
    ),

  async execute(interaction, client) {
    const type = interaction.options.getString("type") || "wallet"
    const leaders = await client.economy.getLeaderboard(10)

    const leaderboardLines = await Promise.all(
      leaders.map(async (user, i) => {
        const discordUser = await client.users.fetch(user.odbc).catch(() => null)
        const name = discordUser?.username || "Unknown"
        const value = type === "total" ? user.wallet + user.bank : user[type]

        const medals = ["[1st]", "[2nd]", "[3rd]"]
        const rank = i < 3 ? medals[i] : `[${i + 1}]`

        return `${rank} ${name.padEnd(15)} ${client.config.emojis.coin} ${formatNumber(value)}`
      }),
    )

    const embed = createTerminalEmbed({
      title: `LEADERBOARD // ${type.toUpperCase()}`,
      description: [
        `┌─ TOP 10 RICHEST ──────────┐`,
        ...leaderboardLines.map((l) => `│ ${l}`),
        `└───────────────────────────┘`,
      ].join("\n"),
      color: client.config.colors.primary,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
