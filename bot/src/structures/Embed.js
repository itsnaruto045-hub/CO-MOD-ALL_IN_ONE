const { EmbedBuilder } = require("discord.js")

class SDFEmbed extends EmbedBuilder {
  constructor(data = {}) {
    super(data)
    this.setColor(data.color || 0x00ff00)
    this.setTimestamp()
    this.setFooter({ text: "% SDF >.." })
  }

  static success(description) {
    return new SDFEmbed().setColor(0x00ff00).setDescription(`\`\`\`ansi\n\u001b[0;32m✓ ${description}\n\`\`\``)
  }

  static error(description) {
    return new SDFEmbed().setColor(0xff0000).setDescription(`\`\`\`ansi\n\u001b[0;31m✗ ${description}\n\`\`\``)
  }

  static warning(description) {
    return new SDFEmbed().setColor(0xffaa00).setDescription(`\`\`\`ansi\n\u001b[0;33m⚠ ${description}\n\`\`\``)
  }

  static terminal(title, content) {
    return new SDFEmbed()
      .setColor(0x00ff00)
      .setTitle(`\`[ ${title} ]\``)
      .setDescription(`\`\`\`ansi\n\u001b[0;32m${content}\n\`\`\``)
  }

  static loading(description) {
    return new SDFEmbed().setColor(0x00ff00).setDescription(`\`\`\`ansi\n\u001b[0;36m◌ ${description}...\n\`\`\``)
  }
}

module.exports = SDFEmbed
