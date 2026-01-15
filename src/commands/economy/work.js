import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt, randomChoice } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

const jobs = [
  { title: "Software Developer", min: 200, max: 500 },
  { title: "Crypto Trader", min: 150, max: 600 },
  { title: "Security Analyst", min: 180, max: 450 },
  { title: "Network Engineer", min: 200, max: 400 },
  { title: "Data Scientist", min: 250, max: 550 },
  { title: "Blockchain Developer", min: 300, max: 650 },
  { title: "Penetration Tester", min: 220, max: 480 },
  { title: "System Administrator", min: 180, max: 380 },
]

export default {
  data: new SlashCommandBuilder().setName("work").setDescription("Work to earn some money"),

  cooldown: 1800, // 30 minutes

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const cooldown = await checkCooldown(odbc, "work")
    if (!cooldown.ready) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ALREADY WORKING",
            description: `Next shift in ${formatDuration(cooldown.remaining)}`,
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const job = randomChoice(jobs)
    const earnings = randomInt(job.min, job.max)

    await client.economy.addMoney(odbc, earnings, "wallet", "work")
    await setCooldown(odbc, "work")

    const embed = createTerminalEmbed({
      title: "WORK COMPLETE",
      description: [
        `┌─ JOB DETAILS ─────────────┐`,
        `│ Role: ${job.title}`,
        `│───────────────────────────│`,
        `│ Earned: ${client.config.emojis.coin} ${formatNumber(earnings)}`,
        `└───────────────────────────┘`,
      ].join("\n"),
      color: client.config.colors.success,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
