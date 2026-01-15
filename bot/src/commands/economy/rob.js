const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")
const { ApplicationCommandOptionType } = require("discord.js")

class RobCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rob",
      description: "Attempt to rob another user",
      category: "Economy",
      options: [
        {
          name: "user",
          description: "User to rob",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
      cooldown: COOLDOWNS.ROB,
    })
  }

  async run(interaction) {
    const target = interaction.options.getUser("user")
    const guildId = interaction.guild?.id || "global"

    if (target.id === interaction.user.id) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot rob yourself")],
        ephemeral: true,
      })
    }

    if (target.bot) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You cannot rob bots")],
        ephemeral: true,
      })
    }

    const robber = await this.client.economyManager.getUser(interaction.user.id, guildId)
    const victim = await this.client.economyManager.getUser(target.id, guildId)

    // Minimum wallet requirement
    if (robber.wallet < 500) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You need at least 500 in your wallet to rob")],
        ephemeral: true,
      })
    }

    if (victim.wallet < 100) {
      return interaction.reply({
        embeds: [SDFEmbed.error("This user doesn't have enough money to rob")],
        ephemeral: true,
      })
    }

    // Check privacy mode
    if (victim.settings?.privacyMode) {
      return interaction.reply({
        embeds: [SDFEmbed.error("This user has privacy mode enabled")],
        ephemeral: true,
      })
    }

    const success = Math.random() * 100 < ECONOMY.ROB_SUCCESS_RATE

    if (success) {
      const maxSteal = Math.floor(victim.wallet * (ECONOMY.ROB_MAX_PERCENTAGE / 100))
      const stolen = Helpers.randomInt(Math.floor(maxSteal * 0.5), maxSteal)

      await this.client.economyManager.removeMoney(
        target.id,
        guildId,
        stolen,
        "wallet",
        `Robbed by ${interaction.user.id}`,
      )
      await this.client.economyManager.addMoney(interaction.user.id, guildId, stolen, "wallet", `Robbed ${target.id}`)

      const embed = new SDFEmbed()
        .setTitle("`[ ROBBERY SUCCESSFUL ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Target: ${target.username.slice(0, 18).padEnd(19)}║
║  Status: SUCCESS             ║
╠══════════════════════════════╣
║  You stole from their wallet!║
║  Stolen: +${Helpers.formatNumber(stolen).padEnd(18)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.reply({ embeds: [embed] })
    } else {
      const fine = Helpers.randomInt(200, 500)
      const actualFine = Math.min(fine, robber.wallet)

      if (actualFine > 0) {
        await this.client.economyManager.removeMoney(
          interaction.user.id,
          guildId,
          actualFine,
          "wallet",
          "Failed robbery fine",
        )
        await this.client.economyManager.addMoney(
          target.id,
          guildId,
          actualFine,
          "wallet",
          "Robbery attempt compensation",
        )
      }

      const embed = new SDFEmbed()
        .setTitle("`[ ROBBERY FAILED ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║  Target: ${target.username.slice(0, 18).padEnd(19)}║
║  Status: CAUGHT!             ║
╠══════════════════════════════╣
║  You got caught and had to   ║
║  pay compensation!           ║
║  Lost: -${Helpers.formatNumber(actualFine).padEnd(20)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = RobCommand
