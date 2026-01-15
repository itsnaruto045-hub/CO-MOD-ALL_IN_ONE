const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View user avatar")
    .addUserOption((opt) => opt.setName("user").setDescription("User to view avatar for")),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }))
      .setDescription(
        `[PNG](${user.displayAvatarURL({ format: "png", size: 4096 })}) | [JPG](${user.displayAvatarURL({ format: "jpg", size: 4096 })}) | [WEBP](${user.displayAvatarURL({ format: "webp", size: 4096 })})`,
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
