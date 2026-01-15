const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure welcome messages")
    .addSubcommand((sub) =>
      sub
        .setName("enable")
        .setDescription("Enable welcome messages")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Welcome channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable welcome messages"))
    .addSubcommand((sub) =>
      sub
        .setName("message")
        .setDescription("Set welcome message")
        .addStringOption((opt) =>
          opt.setName("text").setDescription("Welcome message ({user}, {server}, {membercount})").setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("autorole")
        .setDescription("Set auto role for new members")
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to assign").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("test").setDescription("Test the welcome message"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      (await Guild.create({ guildId: interaction.guild.id }))

    if (!guildData.welcome) guildData.welcome = {}

    switch (subcommand) {
      case "enable":
        const channel = interaction.options.getChannel("channel")
        guildData.welcome.enabled = true
        guildData.welcome.channel = channel.id
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`Welcome messages enabled in ${channel}.`)],
        })

      case "disable":
        guildData.welcome.enabled = false
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0xff6b6b).setDescription("Welcome messages disabled.")],
        })

      case "message":
        guildData.welcome.message = interaction.options.getString("text")
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("Welcome message updated.")],
        })

      case "autorole":
        const role = interaction.options.getRole("role")
        guildData.welcome.autoRole = role.id
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription(`New members will receive ${role}.`)],
        })

      case "test":
        await interaction.client.welcome.handleJoin(interaction.member)
        return interaction.reply({ content: "Test welcome sent!", ephemeral: true })
    }
  },
}
