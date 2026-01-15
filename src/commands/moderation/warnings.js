const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to check warnings for").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user")
    const guildData = await Guild.findOne({ guildId: interaction.guild.id })

    const warnings = guildData?.moderation?.warnings?.get(target.id) || []

    if (warnings.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription(`${target.tag} has no warnings.`)],
      })
    }

    const embed = new EmbedBuilder()
      .setColor(0xffd93d)
      .setTitle(`Warnings for ${target.tag}`)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(
        warnings
          .map(
            (w, i) =>
              `**${i + 1}.** ${w.reason}\n   By: <@${w.moderator}> | <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R>`,
          )
          .join("\n\n"),
      )
      .setFooter({ text: `Total: ${warnings.length} warning(s)` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
