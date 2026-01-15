const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js")

class AntiNukeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "antinuke",
      description: "Configure anti-nuke protection",
      category: "Security",
      options: [
        {
          name: "enable",
          description: "Enable anti-nuke protection",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "disable",
          description: "Disable anti-nuke protection",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "whitelist",
          description: "Whitelist a user from anti-nuke",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "User to whitelist",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "unwhitelist",
          description: "Remove a user from whitelist",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "User to remove",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "status",
          description: "View anti-nuke status",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
      permissions: [PermissionFlagsBits.Administrator],
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const config = await this.client.getGuildConfig(interaction.guild.id)

    switch (subcommand) {
      case "enable": {
        config.antiNuke = config.antiNuke || {}
        config.antiNuke.enabled = true
        await config.save()

        await interaction.reply({
          embeds: [SDFEmbed.success("Anti-nuke protection enabled")],
        })
        break
      }

      case "disable": {
        config.antiNuke = config.antiNuke || {}
        config.antiNuke.enabled = false
        await config.save()

        await interaction.reply({
          embeds: [SDFEmbed.warning("Anti-nuke protection disabled")],
        })
        break
      }

      case "whitelist": {
        const user = interaction.options.getUser("user")
        config.antiNuke = config.antiNuke || {}
        config.antiNuke.whitelistedUsers = config.antiNuke.whitelistedUsers || []

        if (config.antiNuke.whitelistedUsers.includes(user.id)) {
          return interaction.reply({
            embeds: [SDFEmbed.warning("User is already whitelisted")],
            ephemeral: true,
          })
        }

        config.antiNuke.whitelistedUsers.push(user.id)
        await config.save()

        await interaction.reply({
          embeds: [SDFEmbed.success(`${user.username} added to whitelist`)],
        })
        break
      }

      case "unwhitelist": {
        const user = interaction.options.getUser("user")
        config.antiNuke = config.antiNuke || {}
        config.antiNuke.whitelistedUsers = config.antiNuke.whitelistedUsers || []

        const index = config.antiNuke.whitelistedUsers.indexOf(user.id)
        if (index === -1) {
          return interaction.reply({
            embeds: [SDFEmbed.warning("User is not whitelisted")],
            ephemeral: true,
          })
        }

        config.antiNuke.whitelistedUsers.splice(index, 1)
        await config.save()

        await interaction.reply({
          embeds: [SDFEmbed.success(`${user.username} removed from whitelist`)],
        })
        break
      }

      case "status": {
        const status = config.antiNuke?.enabled ? "ENABLED" : "DISABLED"
        const whitelisted = config.antiNuke?.whitelistedUsers?.length || 0
        const lockdown = config.antiNuke?.lockdownActive ? "ACTIVE" : "INACTIVE"

        const embed = new SDFEmbed()
          .setTitle("`[ ANTI-NUKE STATUS ]`")
          .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Status: ${status.padEnd(19)}║
║  Whitelisted: ${String(whitelisted).padEnd(14)}║
║  Lockdown: ${lockdown.padEnd(17)}║
╠══════════════════════════════╣
║  Anti-Ban: ${config.antiNuke?.settings?.antiBan !== false ? "ON " : "OFF"}                ║
║  Anti-Kick: ${config.antiNuke?.settings?.antiKick !== false ? "ON " : "OFF"}               ║
║  Anti-Channel: ${config.antiNuke?.settings?.antiChannelDelete !== false ? "ON " : "OFF"}            ║
║  Anti-Role: ${config.antiNuke?.settings?.antiRoleDelete !== false ? "ON " : "OFF"}               ║
╚══════════════════════════════╝
\`\`\``)
          .setColor(config.antiNuke?.enabled ? 0x00ff00 : 0xff0000)

        await interaction.reply({ embeds: [embed] })
        break
      }
    }
  }
}

module.exports = AntiNukeCommand
