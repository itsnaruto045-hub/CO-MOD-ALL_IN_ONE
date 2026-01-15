const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")

class PrivacyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "privacy",
      description: "Toggle privacy mode for your balance",
      category: "Economy",
      options: [
        {
          name: "mode",
          description: "Enable or disable privacy mode",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Enable", value: "on" },
            { name: "Disable", value: "off" },
          ],
        },
      ],
      cooldown: 10000,
    })
  }

  async run(interaction) {
    const mode = interaction.options.getString("mode")
    const user = await this.client.economyManager.getUser(interaction.user.id, interaction.guild?.id || "global")

    user.settings = user.settings || {}
    user.settings.privacyMode = mode === "on"
    await user.save()

    const embed = new SDFEmbed()
      .setTitle("`[ PRIVACY SETTINGS ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Privacy Mode: ${mode === "on" ? "ENABLED " : "DISABLED"}       ║
╠══════════════════════════════╣
${
  mode === "on"
    ? `║  Others cannot:              ║
║  - See your balance          ║
║  - Rob you                   ║`
    : `║  Your balance is now         ║
║  visible to others.          ║`
}
╚══════════════════════════════╝
\`\`\``)
      .setColor(mode === "on" ? 0x00ff00 : 0xffaa00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = PrivacyCommand
