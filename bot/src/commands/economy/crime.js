const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class CrimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "crime",
      description: "Commit a crime for big money (risky)",
      category: "Economy",
      cooldown: COOLDOWNS.CRIME,
    })
  }

  async run(interaction) {
    const crimes = [
      { name: "Bank heist", successRate: 30, minReward: 2000, maxReward: 5000 },
      { name: "Jewelry store robbery", successRate: 45, minReward: 1000, maxReward: 3000 },
      { name: "Car theft", successRate: 55, minReward: 500, maxReward: 1500 },
      { name: "Pickpocketing", successRate: 70, minReward: 200, maxReward: 800 },
      { name: "Hacking corporate servers", successRate: 35, minReward: 1500, maxReward: 4000 },
      { name: "Art museum heist", successRate: 25, minReward: 3000, maxReward: 8000 },
    ]

    const crime = Helpers.randomChoice(crimes)
    const success = Math.random() * 100 < crime.successRate

    if (success) {
      const earnings = Helpers.randomInt(crime.minReward, crime.maxReward)

      await this.client.economyManager.addMoney(
        interaction.user.id,
        interaction.guild?.id || "global",
        earnings,
        "wallet",
        "Crime earnings",
      )

      const embed = new SDFEmbed()
        .setTitle("`[ CRIME SUCCESSFUL ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Crime: ${crime.name.padEnd(20)}║
║  Status: SUCCESS             ║
╠══════════════════════════════╣
║  You escaped with the loot!  ║
║  Earned: +${Helpers.formatNumber(earnings).padEnd(18)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.reply({ embeds: [embed] })
    } else {
      const fine = Helpers.randomInt(ECONOMY.CRIME_FINE_MIN, ECONOMY.CRIME_FINE_MAX)
      const user = await this.client.economyManager.getUser(interaction.user.id, interaction.guild?.id || "global")

      const actualFine = Math.min(fine, user.wallet)
      if (actualFine > 0) {
        await this.client.economyManager.removeMoney(
          interaction.user.id,
          interaction.guild?.id || "global",
          actualFine,
          "wallet",
          "Crime fine",
        )
      }

      const embed = new SDFEmbed()
        .setTitle("`[ CRIME FAILED ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║  Crime: ${crime.name.padEnd(20)}║
║  Status: CAUGHT!             ║
╠══════════════════════════════╣
║  The police caught you!      ║
║  Fine: -${Helpers.formatNumber(actualFine).padEnd(20)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = CrimeCommand
