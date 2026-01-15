const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class HuntCommand extends Command {
  constructor(client) {
    super(client, {
      name: "hunt",
      description: "Hunt for animals and earn money",
      category: "Economy",
      cooldown: COOLDOWNS.HUNT,
    })
  }

  async run(interaction) {
    const animals = [
      { name: "Rabbit", value: 50, rarity: "common" },
      { name: "Fox", value: 100, rarity: "common" },
      { name: "Deer", value: 200, rarity: "uncommon" },
      { name: "Wolf", value: 350, rarity: "uncommon" },
      { name: "Bear", value: 500, rarity: "rare" },
      { name: "Lion", value: 700, rarity: "rare" },
      { name: "Dragon", value: 1500, rarity: "legendary" },
    ]

    const roll = Math.random() * 100
    let animal

    if (roll < 40) {
      animal = animals.filter((a) => a.rarity === "common")
    } else if (roll < 70) {
      animal = animals.filter((a) => a.rarity === "uncommon")
    } else if (roll < 92) {
      animal = animals.filter((a) => a.rarity === "rare")
    } else {
      animal = animals.filter((a) => a.rarity === "legendary")
    }

    const caught = Helpers.randomChoice(animal)
    const earnings = Helpers.randomInt(caught.value * 0.8, caught.value * 1.2)

    await this.client.economyManager.addMoney(
      interaction.user.id,
      interaction.guild?.id || "global",
      Math.floor(earnings),
      "wallet",
      "Hunt earnings",
    )

    const rarityColors = {
      common: "\u001b[0;37m",
      uncommon: "\u001b[0;32m",
      rare: "\u001b[0;34m",
      legendary: "\u001b[0;33m",
    }

    const embed = new SDFEmbed()
      .setTitle("`[ HUNT COMPLETE ]`")
      .setDescription(`\`\`\`ansi
${rarityColors[caught.rarity]}╔══════════════════════════════╗
║  You caught a ${caught.name.padEnd(14)}║
║  Rarity: ${caught.rarity.toUpperCase().padEnd(18)}║
╠══════════════════════════════╣
║  Sold for: +${Helpers.formatNumber(Math.floor(earnings)).padEnd(16)}║
╚══════════════════════════════╝
\`\`\``)
      .setColor(caught.rarity === "legendary" ? 0xffd700 : caught.rarity === "rare" ? 0x0066ff : 0x00ff00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = HuntCommand
