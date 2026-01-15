const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")

const SHOP_ITEMS = [
  { id: "role_vip", name: "VIP Role", price: 50000, description: "Exclusive VIP role", type: "role" },
  { id: "role_premium", name: "Premium Role", price: 100000, description: "Premium member role", type: "role" },
  {
    id: "multiplier_2x",
    name: "2x Multiplier",
    price: 25000,
    description: "Double earnings for 1 hour",
    type: "boost",
  },
  {
    id: "protection",
    name: "Rob Protection",
    price: 15000,
    description: "Cannot be robbed for 24 hours",
    type: "protection",
  },
  {
    id: "lootbox_common",
    name: "Common Lootbox",
    price: 5000,
    description: "Contains random rewards",
    type: "lootbox",
  },
  { id: "lootbox_rare", name: "Rare Lootbox", price: 15000, description: "Better rewards chance", type: "lootbox" },
  {
    id: "lootbox_legendary",
    name: "Legendary Lootbox",
    price: 50000,
    description: "Best rewards guaranteed",
    type: "lootbox",
  },
]

class ShopCommand extends Command {
  constructor(client) {
    super(client, {
      name: "shop",
      description: "View and buy items from the shop",
      category: "Economy",
      options: [
        {
          name: "view",
          description: "View available items",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "buy",
          description: "Buy an item",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "item",
              description: "Item to buy",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: SHOP_ITEMS.map((i) => ({ name: i.name, value: i.id })),
            },
          ],
        },
      ],
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === "view") {
      let itemList = ""
      for (const item of SHOP_ITEMS) {
        itemList += `║  ${item.name.padEnd(18)} ${Helpers.formatNumber(item.price).padEnd(8)}║\n`
      }

      const embed = new SDFEmbed()
        .setTitle("`[ SHOP ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;33m╔══════════════════════════════╗
║         ITEM SHOP            ║
╠══════════════════════════════╣
${itemList}╠══════════════════════════════╣
║  Use /shop buy <item>        ║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xffd700)

      await interaction.reply({ embeds: [embed] })
    } else if (subcommand === "buy") {
      const itemId = interaction.options.getString("item")
      const item = SHOP_ITEMS.find((i) => i.id === itemId)

      if (!item) {
        return interaction.reply({
          embeds: [SDFEmbed.error("Item not found")],
          ephemeral: true,
        })
      }

      const user = await this.client.economyManager.getUser(interaction.user.id, interaction.guild?.id || "global")

      if (user.wallet < item.price) {
        return interaction.reply({
          embeds: [SDFEmbed.error(`You need ${Helpers.formatNumber(item.price)} coins`)],
          ephemeral: true,
        })
      }

      await this.client.economyManager.removeMoney(
        interaction.user.id,
        interaction.guild?.id || "global",
        item.price,
        "wallet",
        `Purchased ${item.name}`,
      )

      // Add to inventory
      user.inventory = user.inventory || []
      user.inventory.push({
        itemId: item.id,
        quantity: 1,
        purchasedAt: new Date(),
      })
      await user.save()

      const embed = new SDFEmbed()
        .setTitle("`[ PURCHASE COMPLETE ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Item: ${item.name.padEnd(21)}║
║  Price: -${Helpers.formatNumber(item.price).padEnd(19)}║
╠══════════════════════════════╣
║  Added to your inventory!    ║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = ShopCommand
