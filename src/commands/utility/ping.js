const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot latency"),

  async execute(interaction) {
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true })

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Pong!")
      .addFields(
        { name: "Bot Latency", value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: "API Latency", value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
      )
      .setTimestamp()

    await interaction.editReply({ content: null, embeds: [embed] })
  },
}
