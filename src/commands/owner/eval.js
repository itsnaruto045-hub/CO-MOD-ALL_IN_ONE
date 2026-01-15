const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const util = require("util")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluate JavaScript code (Owner only)")
    .addStringOption((opt) => opt.setName("code").setDescription("Code to evaluate").setRequired(true)),
  ownerOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== interaction.client.config.ownerId) {
      return interaction.reply({ content: "Owner only.", ephemeral: true })
    }

    const code = interaction.options.getString("code")

    try {
      let result = eval(code)
      if (result instanceof Promise) result = await result
      result = util.inspect(result, { depth: 2 })

      if (result.length > 1900) result = result.slice(0, 1900) + "..."

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("Eval Result")
        .addFields(
          { name: "Input", value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: "Output", value: `\`\`\`js\n${result}\n\`\`\`` },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Eval Error")
        .addFields(
          { name: "Input", value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: "Error", value: `\`\`\`js\n${error.message}\n\`\`\`` },
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    }
  },
}
