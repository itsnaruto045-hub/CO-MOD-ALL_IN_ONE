const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { ApplicationCommandOptionType } = require("discord.js")

class FreezeEconomyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "freeze-economy",
      description: "Freeze or unfreeze the economy system",
      category: "Owner",
      options: [
        {
          name: "action",
          description: "Freeze or unfreeze",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "freeze", value: "freeze" },
            { name: "unfreeze", value: "unfreeze" },
          ],
        },
      ],
      ownerOnly: true,
    })
  }

  async run(interaction) {
    const action = interaction.options.getString("action")

    if (action === "freeze") {
      this.client.economyFrozen = true
      await interaction.reply({
        embeds: [SDFEmbed.success("Economy has been frozen. No transactions allowed.")],
      })
    } else {
      this.client.economyFrozen = false
      await interaction.reply({
        embeds: [SDFEmbed.success("Economy has been unfrozen. Transactions resumed.")],
      })
    }
  }
}

module.exports = FreezeEconomyCommand
