const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const { CRYPTO } = require("../../utils/Constants")

class CryptoBalanceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "crypto-balance",
      description: "Check your cryptocurrency balances",
      category: "Crypto",
      cooldown: 3000,
    })
  }

  async run(interaction) {
    const balances = await this.client.cryptoManager.getBalance(interaction.user.id)
    const portfolioValue = await this.client.cryptoManager.getPortfolioValue(interaction.user.id)

    let balanceLines = ""
    for (const symbol of CRYPTO.SUPPORTED) {
      const balance = balances[symbol] || 0
      const price = this.client.cryptoManager.getPrice(symbol)
      const value = (balance * price).toFixed(2)
      balanceLines += `║  ${symbol.padEnd(5)} ${balance.toFixed(8).padEnd(14)} $${value.padEnd(8)}║\n`
    }

    const embed = new SDFEmbed()
      .setTitle("`[ CRYPTO WALLET ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;33m╔══════════════════════════════════╗
║  CRYPTOCURRENCY BALANCES         ║
╠══════════════════════════════════╣
${balanceLines}╠══════════════════════════════════╣
║  Portfolio: $${portfolioValue.toFixed(2).padEnd(18)}║
╚══════════════════════════════════╝
\`\`\``)
      .setColor(0xf7931a)

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports = CryptoBalanceCommand
