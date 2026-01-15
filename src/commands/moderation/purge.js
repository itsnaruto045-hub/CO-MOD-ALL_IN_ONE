const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete multiple messages")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .addUserOption((option) => option.setName("user").setDescription("Only delete messages from this user"))
    .addStringOption((option) =>
      option
        .setName("filter")
        .setDescription("Filter messages")
        .addChoices(
          { name: "Bots Only", value: "bots" },
          { name: "Humans Only", value: "humans" },
          { name: "Attachments Only", value: "attachments" },
          { name: "Embeds Only", value: "embeds" },
        ),
    )
    .addStringOption((option) => option.setName("contains").setDescription("Only delete messages containing this text"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount")
    const user = interaction.options.getUser("user")
    const filterType = interaction.options.getString("filter")
    const contains = interaction.options.getString("contains")

    let filter = null
    if (user) filter = { user: user.id }
    else if (filterType === "bots") filter = { bots: true }
    else if (filterType === "humans") filter = { humans: true }
    else if (filterType === "attachments") filter = { attachments: true }
    else if (filterType === "embeds") filter = { embeds: true }
    else if (contains) filter = { contains }

    await interaction.deferReply({ ephemeral: true })

    try {
      const deleted = await interaction.client.moderation.purge(interaction.channel, amount, filter)

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setDescription(`Successfully deleted **${deleted}** messages.`)
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
      await interaction.editReply({
        content: "Failed to delete messages. Messages older than 14 days cannot be bulk deleted.",
      })
    }
  },
}
