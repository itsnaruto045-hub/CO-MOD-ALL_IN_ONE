import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt, randomChoice } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

const responses = [
  { text: "A stranger takes pity on you", amount: [10, 100] },
  { text: "Someone throws coins at you", amount: [5, 50] },
  { text: "A wealthy merchant gives you money", amount: [50, 200] },
  { text: "You found some coins on the ground", amount: [1, 30] },
  { text: "No one cares about you", amount: [0, 0] },
  { text: "Someone spits on you", amount: [0, 0] },
]

export default {
  data: new SlashCommandBuilder().setName("beg").setDescription("Beg for money"),

  async execute(interaction, client) {
    const odbc = interaction.user.id

    const cooldown = await checkCooldown(odbc, "beg")
    if (!cooldown.ready) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "COOLDOWN",
            description: `Wait ${formatDuration(cooldown.remaining)}`,
            color: client.config.colors.warning,
          }),
        ],
        ephemeral: true,
      })
    }

    const response = randomChoice(responses)
    const amount = randomInt(response.amount[0], response.amount[1])

    if (amount > 0) {
      await client.economy.addMoney(odbc, amount, "wallet", "beg")
    }

    await setCooldown(odbc, "beg")

    const embed = createTerminalEmbed({
      title: amount > 0 ? "BEG SUCCESSFUL" : "BEG FAILED",
      description: [
        response.text,
        amount > 0 ? `You received ${client.config.emojis.coin} ${formatNumber(amount)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      color: amount > 0 ? client.config.colors.success : client.config.colors.error,
    })

    await interaction.reply({ embeds: [embed] })
  },
}
