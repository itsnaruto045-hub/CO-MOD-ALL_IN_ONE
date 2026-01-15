const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ECONOMY, COOLDOWNS } = require("../../utils/Constants")

class WorkCommand extends Command {
  constructor(client) {
    super(client, {
      name: "work",
      description: "Work to earn some money",
      category: "Economy",
      cooldown: COOLDOWNS.WORK,
    })
  }

  async run(interaction) {
    const jobs = [
      {
        name: "Hacker",
        messages: ["Breached a secure server", "Sold exploits on dark web", "Cracked encryption keys"],
      },
      { name: "Developer", messages: ["Fixed production bugs", "Deployed new features", "Reviewed pull requests"] },
      { name: "Trader", messages: ["Made profitable trades", "Analyzed market trends", "Closed a big deal"] },
      { name: "Security Analyst", messages: ["Found vulnerabilities", "Patched security holes", "Stopped a breach"] },
      { name: "Data Scientist", messages: ["Analyzed datasets", "Built ML models", "Predicted trends"] },
    ]

    const job = Helpers.randomChoice(jobs)
    const message = Helpers.randomChoice(job.messages)
    const earnings = Helpers.randomInt(ECONOMY.WORK_MIN, ECONOMY.WORK_MAX)

    await this.client.economyManager.addMoney(
      interaction.user.id,
      interaction.guild?.id || "global",
      earnings,
      "wallet",
      "Work earnings",
    )

    const embed = new SDFEmbed()
      .setTitle(`\`[ WORK COMPLETE ]\``)
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Job: ${job.name.padEnd(22)}║
╠══════════════════════════════╣
║  ${message.padEnd(28)}║
╠══════════════════════════════╣
║  Earned: +${Helpers.formatNumber(earnings).padEnd(17)}║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00ff00)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = WorkCommand
