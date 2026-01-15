const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js")

class LockdownCommand extends Command {
  constructor(client) {
    super(client, {
      name: "lockdown",
      description: "Lock or unlock the server",
      category: "Security",
      options: [
        {
          name: "action",
          description: "Lock or unlock",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "lock", value: "lock" },
            { name: "unlock", value: "unlock" },
          ],
        },
      ],
      permissions: [PermissionFlagsBits.Administrator],
      cooldown: 10000,
    })
  }

  async run(interaction) {
    const action = interaction.options.getString("action")

    await interaction.deferReply()

    if (action === "lock") {
      await this.client.antiNukeManager.lockdownServer(interaction.guild)

      const embed = new SDFEmbed()
        .setTitle("`[ SERVER LOCKDOWN ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║    SERVER LOCKED DOWN        ║
╠══════════════════════════════╣
║  All channels restricted     ║
║  Use /lockdown unlock        ║
║  to restore access           ║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await interaction.editReply({ embeds: [embed] })
    } else {
      await this.client.antiNukeManager.unlockServer(interaction.guild)

      const embed = new SDFEmbed()
        .setTitle("`[ LOCKDOWN LIFTED ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║    SERVER UNLOCKED           ║
╠══════════════════════════════╣
║  All channels restored       ║
║  Normal operations resumed   ║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.editReply({ embeds: [embed] })
    }
  }
}

module.exports = LockdownCommand
