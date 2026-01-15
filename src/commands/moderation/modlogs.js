const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("Configure moderation logs channel")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set the moderation logs channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel for mod logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable moderation logs"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      (await Guild.create({ guildId: interaction.guild.id }))

    if (!guildData.moderation) guildData.moderation = {}

    if (subcommand === "set") {
      const channel = interaction.options.getChannel("channel")
      guildData.moderation.logChannel = channel.id
      await guildData.save()

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`Moderation logs will be sent to ${channel}.`)],
      })
    } else {
      guildData.moderation.logChannel = null
      await guildData.save()

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff6b6b).setDescription("Moderation logs have been disabled.")],
      })
    }
  },
}
