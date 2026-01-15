const Logger = require("../utils/Logger")
const SDFEmbed = require("../structures/Embed")
const Helpers = require("../utils/Helpers")

module.exports = {
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    // Log command usage
    Logger.command(interaction.user.tag, interaction.commandName, interaction.guild?.name || "DM")

    // Check if command is enabled
    if (!command.enabled) {
      return interaction.reply({
        embeds: [SDFEmbed.error("This command is currently disabled")],
        ephemeral: true,
      })
    }

    // Check owner-only
    if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
      return interaction.reply({
        embeds: [SDFEmbed.error("This command is restricted to the bot owner")],
        ephemeral: true,
      })
    }

    // Check user permissions
    if (command.permissions.length > 0 && interaction.guild) {
      const missingPerms = command.permissions.filter((perm) => !interaction.member.permissions.has(perm))
      if (missingPerms.length > 0) {
        return interaction.reply({
          embeds: [SDFEmbed.error(`Missing permissions: ${missingPerms.join(", ")}`)],
          ephemeral: true,
        })
      }
    }

    // Check bot permissions
    if (command.botPermissions.length > 0 && interaction.guild) {
      const missingPerms = command.botPermissions.filter((perm) => !interaction.guild.members.me.permissions.has(perm))
      if (missingPerms.length > 0) {
        return interaction.reply({
          embeds: [SDFEmbed.error(`I'm missing permissions: ${missingPerms.join(", ")}`)],
          ephemeral: true,
        })
      }
    }

    // Check cooldown
    if (command.cooldown > 0) {
      const remaining = client.cooldownManager.getRemainingTime(interaction.user.id, command.name)
      if (remaining > 0) {
        return interaction.reply({
          embeds: [SDFEmbed.warning(`Cooldown: ${Helpers.formatDuration(remaining)} remaining`)],
          ephemeral: true,
        })
      }
    }

    try {
      // Set cooldown
      if (command.cooldown > 0) {
        client.cooldownManager.setCooldown(interaction.user.id, command.name, command.cooldown)
      }

      await command.run(interaction)
    } catch (error) {
      Logger.error(`Command error (${command.name}): ${error.message}`)
      console.error(error)

      const errorEmbed = SDFEmbed.error("An error occurred while executing this command")

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true })
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
      }
    }
  },
}
