const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType } = require("discord.js")

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "Play a song or add it to the queue",
      category: "Music",
      options: [
        {
          name: "query",
          description: "Song name or URL",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const query = interaction.options.getString("query")
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SDFEmbed.error("You must be in a voice channel")],
        ephemeral: true,
      })
    }

    await interaction.deferReply()

    try {
      const musicManager = this.client.musicManager || require("../../managers/MusicManager")

      if (!this.client.musicManager) {
        this.client.musicManager = new musicManager(this.client)
      }

      let queue = this.client.musicManager.getQueue(interaction.guild.id)

      if (!queue) {
        queue = this.client.musicManager.createQueue(interaction.guild.id, interaction.channel, voiceChannel)
      }

      const result = await this.client.musicManager.search(query)

      if (!result || !result.data || result.data.length === 0) {
        return interaction.editReply({
          embeds: [SDFEmbed.error("No results found")],
        })
      }

      const track = result.data[0]
      queue.add(track)

      const embed = new SDFEmbed()
        .setTitle("`[ ADDED TO QUEUE ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  ${Helpers.truncate(track.info?.title || "Unknown", 27).padEnd(27)}║
║  Duration: ${Helpers.formatDuration(track.info?.length || 0).padEnd(17)}║
║  Position: #${String(queue.tracks.length).padEnd(16)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x1db954)

      await interaction.editReply({ embeds: [embed] })

      if (!queue.currentTrack) {
        await this.client.musicManager.play(queue)
      }
    } catch (error) {
      console.error(error)
      await interaction.editReply({
        embeds: [SDFEmbed.error(`Failed to play: ${error.message}`)],
      })
    }
  }
}

module.exports = PlayCommand
