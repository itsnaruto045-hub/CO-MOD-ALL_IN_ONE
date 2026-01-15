import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt, randomChoice } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

const crimes = [
  { name: "Hacked a server", success: 60, min: 500, max: 2000, fine: 300 },
  { name: "Crypto scam", success: 45, min: 1000, max: 3500, fine: 800 },
  { name: "Bank heist", success: 30, min: 2000, max: 6000, fine: 1500 },
  { name: "Identity theft", success: 55, min: 400, max: 1800, fine: 400 },
  { name: "Data breach", success: 50, min: 600, max: 2200, fine: 500 },
]

export default {
  data: new SlashCommandBuilder().setName("crime").setDescription("Commit a crime (risky but rewarding)"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const cooldown = await checkCooldown(odbc, "crime")
    if (!cooldown.ready) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "LAYING LOW",
            description: `You need to wait ${formatDuration(cooldown.remaining)}`,
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const crime = randomChoice(crimes)
    const success = randomInt(1, 100) <= crime.success

    await setCooldown(odbc, "crime")

    if (success) {
      const earnings = randomInt(crime.min, crime.max)
      await client.economy.addMoney(odbc, earnings, "wallet", "crime")

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "CRIME SUCCESSFUL",
            description: [
              `┌─ OPERATION DETAILS ───────┐`,
              `│ Crime: ${crime.name}`,
              `│ Loot:  ${client.config.emojis.coin} ${formatNumber(earnings)}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.success,
          }),
        ],
      })
    } else {
      const user = await client.economy.getUser(odbc)
      const fine = Math.min(crime.fine, user.wallet)

      if (fine > 0) {
        await client.economy.removeMoney(odbc, fine, "wallet", "crime_fine")
      }

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "BUSTED",
            description: [
              `┌─ ARREST REPORT ───────────┐`,
              `│ Crime: ${crime.name}`,
              `│ Fine:  ${client.config.emojis.coin} -${formatNumber(fine)}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.error,
          }),
        ],
      })
    }
  },
}
