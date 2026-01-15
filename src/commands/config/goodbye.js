const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("goodbye")
    .setDescription("Configure goodbye messages")
    .addSubcommand((sub) =>
      sub
        .setName("enable")
        .setDescription("Enable goodbye messages")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Goodbye channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable goodbye messages"))
    .addSubcommand((sub) =>
      sub
        .setName("message")
        .setDescription("Set goodbye message")
        .addStringOption((opt) =>
          opt.setName("text").setDescription("Goodbye message ({user}, {server}, {membercount})").setRequired(true),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      (await Guild.create({ guildId: interaction.guild.id }))

    if (!guildData.goodbye) guildData.goodbye = {}

    switch (subcommand) {
      case "enable":
        const channel = interaction.options.getChannel("channel")
        guildData.goodbye.enabled = true
        guildData.goodbye.channel = channel.id
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`Goodbye messages enabled in ${channel}.`)],
        })

      case "disable":
        guildData.goodbye.enabled = false
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0xff6b6b).setDescription("Goodbye messages disabled.")],
        })

      case "message":
        guildData.goodbye.message = interaction.options.getString("text")
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("Goodbye message updated.")],
        })
    }
  },
}
