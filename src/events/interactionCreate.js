import { EmbedBuilder } from "discord.js"

export default {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (interaction.isButton()) {
      return handleButton(interaction, client)
    }

    if (interaction.isStringSelectMenu()) {
      return // Handled by collectors in commands
    }

    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    // Owner check for owner-only commands
    if (command.ownerOnly && interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        embeds: [createEmbed("Access Denied", "This command is restricted.", client.config.colors.error)],
        ephemeral: true,
      })
    }

    // Cooldown check
    if (command.cooldown) {
      const cooldownKey = `${interaction.user.id}-${command.data.name}`
      const cooldownTime = client.cooldowns.get(cooldownKey)

      if (cooldownTime && Date.now() < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - Date.now()) / 1000)
        return interaction.reply({
          embeds: [
            createEmbed("Cooldown", `Wait ${remaining}s before using this again.`, client.config.colors.warning),
          ],
          ephemeral: true,
        })
      }

      client.cooldowns.set(cooldownKey, Date.now() + command.cooldown * 1000)
      setTimeout(() => client.cooldowns.delete(cooldownKey), command.cooldown * 1000)
    }

    try {
      await command.execute(interaction, client)
    } catch (error) {
      console.error(`[CMD] Error in ${command.data.name}:`, error)

      const reply = {
        embeds: [createEmbed("Error", "An error occurred while executing this command.", client.config.colors.error)],
        ephemeral: true,
      }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply)
      } else {
        await interaction.reply(reply)
      }
    }
  },
}

async function handleButton(interaction, client) {
  const { customId } = interaction

  try {
    // Ticket buttons
    if (customId === "ticket_create") {
      return await client.tickets.createTicket(interaction)
    }
    if (customId === "ticket_close") {
      return await client.tickets.closeTicket(interaction)
    }
    if (customId === "ticket_claim") {
      return await client.tickets.claimTicket(interaction)
    }

    // Music buttons
    if (customId === "music_pause") {
      const player = client.music.players.get(interaction.guild.id)
      if (!player) return interaction.reply({ content: "No music playing.", ephemeral: true })
      player.paused ? player.resume() : player.pause()
      return interaction.reply({
        content: player.paused ? "Paused." : "Resumed.",
        ephemeral: true,
      })
    }
    if (customId === "music_skip") {
      const player = client.music.players.get(interaction.guild.id)
      if (!player) return interaction.reply({ content: "No music playing.", ephemeral: true })
      player.stop()
      return interaction.reply({ content: "Skipped.", ephemeral: true })
    }
    if (customId === "music_stop") {
      const player = client.music.players.get(interaction.guild.id)
      if (!player) return interaction.reply({ content: "No music playing.", ephemeral: true })
      player.queue = []
      player.stop()
      return interaction.reply({ content: "Stopped and cleared queue.", ephemeral: true })
    }
    if (customId === "music_shuffle") {
      const player = client.music.players.get(interaction.guild.id)
      if (!player?.queue?.length) return interaction.reply({ content: "No songs in queue.", ephemeral: true })
      for (let i = player.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[player.queue[i], player.queue[j]] = [player.queue[j], player.queue[i]]
      }
      return interaction.reply({ content: "Queue shuffled.", ephemeral: true })
    }
    if (customId === "music_loop") {
      const player = client.music.players.get(interaction.guild.id)
      if (!player) return interaction.reply({ content: "No music playing.", ephemeral: true })
      player.loop = player.loop === "none" ? "track" : player.loop === "track" ? "queue" : "none"
      return interaction.reply({ content: `Loop: ${player.loop}`, ephemeral: true })
    }

    // Game buttons are handled by collectors in game commands
  } catch (error) {
    console.error("[BTN] Error:", error)
    if (!interaction.replied) {
      await interaction.reply({ content: "An error occurred.", ephemeral: true }).catch(() => {})
    }
  }
}

function createEmbed(title, description, color) {
  return new EmbedBuilder()
    .setTitle(`\`\`\`${title}\`\`\``)
    .setDescription(`\`\`\`${description}\`\`\``)
    .setColor(color)
    .setTimestamp()
}
