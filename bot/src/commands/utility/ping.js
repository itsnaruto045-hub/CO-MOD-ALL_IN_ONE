const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")

class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Check bot latency",
      category: "Utility",
      cooldown: 5000,
    })
  }

  async run(interaction) {
    const sent = await interaction.reply({
      embeds: [SDFEmbed.loading("Calculating latency")],
      fetchReply: true,
    })

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp
    const wsLatency = this.client.ws.ping

    const embed = new SDFEmbed()
      .setTitle("`[ SYSTEM STATUS ]`")
      .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Roundtrip: ${String(roundtrip).padEnd(14)}ms ║
║  WebSocket: ${String(wsLatency).padEnd(14)}ms ║
║  Status: OPERATIONAL         ║
╚══════════════════════════════╝
\`\`\``)
      .setColor(0x00ff00)

    await interaction.editReply({ embeds: [embed] })
  }
}

module.exports = PingCommand
