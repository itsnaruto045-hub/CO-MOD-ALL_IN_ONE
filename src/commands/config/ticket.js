const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Configure ticket system")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Setup ticket system")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Channel for ticket panel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption((opt) =>
          opt.setName("category").setDescription("Category for tickets").addChannelTypes(ChannelType.GuildCategory),
        )
        .addRoleOption((opt) => opt.setName("support").setDescription("Support role")),
    )
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable ticket system"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      (await Guild.create({ guildId: interaction.guild.id }))

    if (!guildData.tickets) guildData.tickets = {}

    if (subcommand === "setup") {
      const channel = interaction.options.getChannel("channel")
      const category = interaction.options.getChannel("category")
      const supportRole = interaction.options.getRole("support")

      guildData.tickets.enabled = true
      guildData.tickets.category = category?.id
      guildData.tickets.supportRole = supportRole?.id
      await guildData.save()

      await interaction.client.tickets.createTicketPanel(channel, {
        title: "Support Tickets",
        description: "Click the button below to create a support ticket.\n\nOur team will respond as soon as possible.",
      })

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`Ticket system setup in ${channel}.`)],
      })
    } else {
      guildData.tickets.enabled = false
      await guildData.save()

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff6b6b).setDescription("Ticket system disabled.")],
      })
    }
  },
}
