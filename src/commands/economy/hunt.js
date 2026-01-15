import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, weightedRandom } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

const animals = [
  { name: "Rabbit", value: 50, weight: 30 },
  { name: "Deer", value: 150, weight: 25 },
  { name: "Boar", value: 200, weight: 20 },
  { name: "Wolf", value: 300, weight: 12 },
  { name: "Bear", value: 500, weight: 8 },
  { name: "Dragon", value: 1500, weight: 3 },
  { name: "Nothing", value: 0, weight: 15 },
]

export default {
  data: new SlashCommandBuilder().setName("hunt").setDescription("Go hunting for animals"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const cooldown = await checkCooldown(odbc, "hunt")
    if (!cooldown.ready) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "RESTING",
            description: `You can hunt again in ${formatDuration(cooldown.remaining)}`,
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const result = weightedRandom(animals)

    if (result.value > 0) {
      await client.economy.addMoney(odbc, result.value, "wallet", "hunt")
    }

    await setCooldown(odbc, "hunt")

    const embed = createTerminalEmbed({
      title: result.value > 0 ? "HUNT SUCCESSFUL" : "HUNT FAILED",
      description:
        result.value > 0
          ? [
              `┌─ HUNT RESULTS ────────────┐`,
              `│ Caught: ${result.name}`,
              `│ Value:  ${client.config.emojis.coin} ${formatNumber(result.value)}`,
              `└───────────────────────────┘`,
            ].join("\n")
          : `You searched but found nothing...`,
      color: result.value > 0 ? client.config.colors.success : client.config.colors.error,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
