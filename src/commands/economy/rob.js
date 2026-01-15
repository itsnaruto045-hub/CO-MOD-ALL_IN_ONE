import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed } from "../../utils/embed.js"
import { formatNumber, formatDuration, randomInt } from "../../utils/helpers.js"
import { checkCooldown, setCooldown } from "../../utils/cooldown.js"

export default {
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Attempt to rob another user")
    .addUserOption((opt) => opt.setName("target").setDescription("The user to rob").setRequired(true)),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const target = interaction.options.getUser("target")

    if (target.id === odbc) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot rob yourself.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    if (target.bot) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ERROR",
            description: "You cannot rob bots.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    const cooldown = await checkCooldown(odbc, "rob")
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

    const targetBalance = await client.economy.getBalance(target.id)
    const userBalance = await client.economy.getBalance(odbc)

    if (targetBalance.wallet < 100) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "NOT WORTH IT",
            description: "Target has less than 100 coins in wallet.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    if (userBalance.wallet < 200) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "TOO POOR",
            description: "You need at least 200 coins to attempt a robbery.",
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    await setCooldown(odbc, "rob")

    // 40% success rate
    const success = randomInt(1, 100) <= 40

    if (success) {
      const stolen = Math.floor(targetBalance.wallet * (randomInt(10, 35) / 100))

      await client.economy.removeMoney(target.id, stolen, "wallet", "robbed")
      await client.economy.addMoney(odbc, stolen, "wallet", "rob")

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ROBBERY SUCCESSFUL",
            description: [
              `┌─ HEIST REPORT ────────────┐`,
              `│ Target: ${target.username}`,
              `│ Stolen: ${client.config.emojis.coin} ${formatNumber(stolen)}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.success,
          }),
        ],
      })
    } else {
      const fine = Math.floor(userBalance.wallet * 0.25)
      await client.economy.removeMoney(odbc, fine, "wallet", "rob_failed")
      await client.economy.addMoney(target.id, fine, "wallet", "rob_compensation")

      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "ROBBERY FAILED",
            description: [
              `┌─ FAILURE REPORT ──────────┐`,
              `│ You got caught!`,
              `│ Fine: ${client.config.emojis.coin} -${formatNumber(fine)}`,
              `│ Paid to: ${target.username}`,
              `└───────────────────────────┘`,
            ].join("\n"),
            color: client.config.colors.error,
          }),
        ],
      })
    }
  },
}
