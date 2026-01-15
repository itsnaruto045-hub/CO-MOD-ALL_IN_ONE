const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class BegCommand extends Command {
  constructor(client) {
    super(client, {
      name: "beg",
      description: "Beg for money on the streets",
      category: "Economy",
      cooldown: COOLDOWNS.BEG,
    })
  }

  async run(interaction) {
    const donors = [
      { name: "Elon Musk", generous: true },
      { name: "Jeff Bezos", generous: true },
      { name: "Bill Gates", generous: true },
      { name: "A kind stranger", generous: true },
      { name: "Local millionaire", generous: true },
      { name: "Crypto whale", generous: true },
      { name: "Grumpy old man", generous: false },
      { name: "Busy businessman", generous: false },
      { name: "A pigeon", generous: false },
    ]

    const donor = Helpers.randomChoice(donors)
    const success = donor.generous && Math.random() > 0.2

    if (success) {
      const earnings = Helpers.randomInt(ECONOMY.BEG_MIN, ECONOMY.BEG_MAX)

      await this.client.economyManager.addMoney(
        interaction.user.id,
        interaction.guild?.id || "global",
        earnings,
        "wallet",
        "Begging",
      )

      const embed = new SDFEmbed()
        .setTitle("`[ BEGGING ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  ${donor.name.padEnd(27)}║
║  gave you some money!        ║
╠══════════════════════════════╣
║  Received: +${Helpers.formatNumber(earnings).padEnd(16)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0x00ff00)

      await interaction.reply({ embeds: [embed] })
    } else {
      const embed = new SDFEmbed()
        .setTitle("`[ BEGGING ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;31m╔══════════════════════════════╗
║  ${donor.name.padEnd(27)}║
║  ignored you completely.     ║
╠══════════════════════════════╣
║  You received nothing.       ║
╚══════════════════════════════╝
\`\`\``)
        .setColor(0xff0000)

      await interaction.reply({ embeds: [embed] })
    }
  }
}

module.exports = BegCommand
