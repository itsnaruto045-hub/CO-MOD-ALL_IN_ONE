const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")

class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "View the music queue",
      category: "Music",
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const queue = this.client.musicManager?.getQueue(interaction.guild.id)

    if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
      return interaction.reply({
        embeds: [SDFEmbed.warning("Queue is empty")],
        ephemeral: true,
      })
    }

    let description = "```ansi\n\u001b[0;32m╔══════════════════════════════════════╗\n"

    if (queue.currentTrack) {
      const title = Helpers.truncate(queue.currentTrack.info?.title || "Unknown", 30)
      description += `║ NOW: ${title.padEnd(31)}║\n`
    }

    description += "╠══════════════════════════════════════╣\n"

    if (queue.tracks.length === 0) {
      description += "║  No upcoming tracks                  ║\n"
    } else {
      const tracks = queue.tracks.slice(0, 10)
      tracks.forEach((track, i) => {
        const title = Helpers.truncate(track.info?.title || "Unknown", 28)
        description += `║ ${String(i + 1).padStart(2)}. ${title.padEnd(31)}║\n`
      })

      if (queue.tracks.length > 10) {
        description += `║ ... and ${queue.tracks.length - 10} more tracks${" ".repeat(15)}║\n`
      }
    }

    description += "╚══════════════════════════════════════╝\n```"

    const embed = new SDFEmbed().setTitle("`[ MUSIC QUEUE ]`").setDescription(description).setColor(0x1db954)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = QueueCommand
