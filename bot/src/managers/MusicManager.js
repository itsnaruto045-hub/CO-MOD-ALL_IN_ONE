const { Collection } = require("discord.js")
const { MUSIC } = require("../utils/Constants")

class MusicQueue {
  constructor(client, guildId, textChannel, voiceChannel) {
    this.client = client
    this.guildId = guildId
    this.textChannel = textChannel
    this.voiceChannel = voiceChannel
    this.tracks = []
    this.currentTrack = null
    this.player = null
    this.volume = MUSIC.DEFAULT_VOLUME
    this.loop = "none" // none, track, queue
    this.paused = false
    this.twentyFourSeven = false
    this.filters = {}
  }

  add(track) {
    if (this.tracks.length >= MUSIC.MAX_QUEUE_SIZE) {
      throw new Error("Queue is full")
    }
    this.tracks.push(track)
  }

  remove(index) {
    return this.tracks.splice(index, 1)[0]
  }

  clear() {
    this.tracks = []
  }

  shuffle() {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]]
    }
  }

  next() {
    if (this.loop === "track" && this.currentTrack) {
      return this.currentTrack
    }

    if (this.loop === "queue" && this.currentTrack) {
      this.tracks.push(this.currentTrack)
    }

    this.currentTrack = this.tracks.shift() || null
    return this.currentTrack
  }
}

class MusicManager {
  constructor(client) {
    this.client = client
    this.queues = new Collection()
  }

  getQueue(guildId) {
    return this.queues.get(guildId)
  }

  createQueue(guildId, textChannel, voiceChannel) {
    const queue = new MusicQueue(this.client, guildId, textChannel, voiceChannel)
    this.queues.set(guildId, queue)
    return queue
  }

  deleteQueue(guildId) {
    const queue = this.queues.get(guildId)
    if (queue?.player) {
      queue.player.destroy()
    }
    this.queues.delete(guildId)
  }

  async search(query, source = "youtube") {
    const node = this.client.shoukaku.getNode()
    if (!node) throw new Error("No Lavalink nodes available")

    let searchQuery = query
    if (!query.startsWith("http")) {
      const prefixes = {
        youtube: "ytsearch:",
        soundcloud: "scsearch:",
        spotify: "spsearch:",
      }
      searchQuery = `${prefixes[source] || "ytsearch:"}${query}`
    }

    const result = await node.rest.resolve(searchQuery)
    return result
  }

  async play(queue) {
    if (!queue.currentTrack) {
      queue.currentTrack = queue.next()
    }

    if (!queue.currentTrack) {
      return this.deleteQueue(queue.guildId)
    }

    const node = this.client.shoukaku.getNode()
    if (!node) throw new Error("No Lavalink nodes available")

    if (!queue.player) {
      queue.player = await node.joinChannel({
        guildId: queue.guildId,
        channelId: queue.voiceChannel.id,
        shardId: 0,
        deaf: true,
      })

      queue.player.on("end", async () => {
        queue.currentTrack = queue.next()
        if (queue.currentTrack) {
          await this.play(queue)
        } else if (!queue.twentyFourSeven) {
          setTimeout(() => {
            if (!queue.currentTrack && !queue.tracks.length) {
              this.deleteQueue(queue.guildId)
            }
          }, MUSIC.DISCONNECT_TIMEOUT)
        }
      })

      queue.player.on("error", (error) => {
        console.error("Player error:", error)
        queue.currentTrack = queue.next()
        if (queue.currentTrack) {
          this.play(queue)
        }
      })
    }

    await queue.player.playTrack({ track: queue.currentTrack.encoded })
    queue.player.setVolume(queue.volume / 100)
  }

  applyFilter(queue, filterName) {
    if (!queue.player) return

    const filters = {
      bassboost: {
        equalizer: [
          { band: 0, gain: 0.6 },
          { band: 1, gain: 0.5 },
        ],
      },
      nightcore: { timescale: { speed: 1.3, pitch: 1.3 } },
      vaporwave: { timescale: { speed: 0.85, pitch: 0.85 } },
      "8d": { rotation: { rotationHz: 0.2 } },
      tremolo: { tremolo: { frequency: 4, depth: 0.75 } },
      vibrato: { vibrato: { frequency: 4, depth: 0.75 } },
    }

    if (filterName === "clear") {
      queue.player.setFilters({})
      queue.filters = {}
    } else if (filters[filterName]) {
      queue.filters[filterName] = !queue.filters[filterName]
      const activeFilters = Object.entries(queue.filters)
        .filter(([_, active]) => active)
        .reduce((acc, [name]) => ({ ...acc, ...filters[name] }), {})
      queue.player.setFilters(activeFilters)
    }
  }
}

module.exports = MusicManager
