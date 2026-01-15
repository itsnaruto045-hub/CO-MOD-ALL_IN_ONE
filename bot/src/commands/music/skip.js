const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")

class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
      category: "Music",
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const queue = this.client.musicManager?.getQueue(interaction.guild.id)

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [SDFEmbed.error("Nothing is playing")],
        ephemeral: true,
      })
    }

    const skipped = queue.currentTrack
    queue.player.stopTrack()

    const embed = new SDFEmbed()
      .setTitle("`[ SKIPPED ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;33m╔══════════════════════════════╗
║  Skipped current track       ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0xffaa00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = SkipCommand
