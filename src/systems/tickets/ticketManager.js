const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js")
const Guild = require("../../database/schemas/Guild")

class TicketManager {
  constructor(client) {
    this.client = client
  }

  async createTicketPanel(channel, config) {
    const embed = new EmbedBuilder()
      .setColor(config.color || 0x5865f2)
      .setTitle(config.title || "Support Tickets")
      .setDescription(config.description || "Click the button below to create a support ticket.")
      .setFooter({ text: "Our team will assist you shortly!" })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Create Ticket")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary),
    )

    return channel.send({ embeds: [embed], components: [row] })
  }

  async createTicket(interaction) {
    const guildData = await Guild.findOne({ guildId: interaction.guild.id })
    if (!guildData?.tickets?.enabled) return

    // Check for existing ticket
    const existingTicket = interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${interaction.user.username.toLowerCase()}`,
    )

    if (existingTicket) {
      return interaction.reply({
        content: `You already have an open ticket: ${existingTicket}`,
        ephemeral: true,
      })
    }

    const category = guildData.tickets.category
      ? interaction.guild.channels.cache.get(guildData.tickets.category)
      : null

    const supportRole = guildData.tickets.supportRole
      ? interaction.guild.roles.cache.get(guildData.tickets.supportRole)
      : null

    const permissionOverwrites = [
      { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      {
        id: interaction.client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
      },
    ]

    if (supportRole) {
      permissionOverwrites.push({
        id: supportRole.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })
    }

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category?.id,
      permissionOverwrites,
    })

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Support Ticket")
      .setDescription(
        `Hello ${interaction.user}, please describe your issue and our support team will assist you shortly.`,
      )
      .addFields(
        { name: "User", value: `${interaction.user.tag}`, inline: true },
        { name: "Created", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      )
      .setTimestamp()

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close Ticket")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("ticket_claim").setLabel("Claim").setEmoji("✋").setStyle(ButtonStyle.Secondary),
    )

    await ticketChannel.send({
      content: supportRole ? `${supportRole}` : undefined,
      embeds: [embed],
      components: [row],
    })

    await interaction.reply({
      content: `Your ticket has been created: ${ticketChannel}`,
      ephemeral: true,
    })
  }

  async closeTicket(interaction) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle("Ticket Closing")
      .setDescription("This ticket will be deleted in 5 seconds...")
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {})
    }, 5000)
  }

  async claimTicket(interaction) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x6bff6b)
      .setDescription(`This ticket has been claimed by ${interaction.user}.`)
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = TicketManager
