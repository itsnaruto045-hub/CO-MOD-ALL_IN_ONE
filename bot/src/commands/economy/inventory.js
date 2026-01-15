const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")

class InventoryCommand extends Command {
  constructor(client) {
    super(client, {
      name: "inventory",
      description: "View your inventory",
      category: "Economy",
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const user = await this.client.economyManager.getUser(interaction.user.id, interaction.guild?.id || "global")

    if (!user.inventory || user.inventory.length === 0) {
      return interaction.reply({
        embeds: [SDFEmbed.warning("Your inventory is empty")],
        ephemeral: true,
      })
    }

    // Count items
    const itemCounts = {}
    for (const item of user.inventory) {
      itemCounts[item.itemId] = (itemCounts[item.itemId] || 0) + 1
    }

    let itemList = ""
    for (const [itemId, count] of Object.entries(itemCounts)) {
      const name = itemId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      itemList += `║  ${name.padEnd(20)} x${String(count).padEnd(5)}║\n`
    }

    const embed = new SDFEmbed()
      .setTitle("`[ INVENTORY ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;36m╔══════════════════════════════╗
║        YOUR ITEMS            ║
╠══════════════════════════════╣
${itemList}╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00aaff)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = InventoryCommand
