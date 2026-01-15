import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

export function createTerminalEmbed(options = {}) {
  const { title = "", description = "", fields = [], color = 0x00ff00, footer = "% SDF >.", timestamp = true } = options

  const embed = new EmbedBuilder().setColor(color)

  if (title) {
    embed.setTitle(`\`\`\`ansi\n\u001b[0;32m${title}\n\`\`\``)
  }

  if (description) {
    embed.setDescription(`\`\`\`ansi\n\u001b[0;37m${description}\n\`\`\``)
  }

  if (fields.length > 0) {
    embed.addFields(
      fields.map((f) => ({
        name: `\`${f.name}\``,
        value: `\`\`\`${f.value}\`\`\``,
        inline: f.inline ?? false,
      })),
    )
  }

  if (footer) {
    embed.setFooter({ text: footer })
  }

  if (timestamp) {
    embed.setTimestamp()
  }

  return embed
}

export function createProgressBar(current, max, length = 10) {
  const filled = Math.round((current / max) * length)
  const empty = length - filled
  return `[${"▓".repeat(filled)}${"░".repeat(empty)}]`
}

export function createAnimatedEmbed(frames, interval = 1000) {
  return { frames, interval, currentFrame: 0 }
}

export function createButton(options) {
  const { id, label, style = "primary", emoji, disabled = false } = options

  const styleMap = {
    primary: ButtonStyle.Primary,
    secondary: ButtonStyle.Secondary,
    success: ButtonStyle.Success,
    danger: ButtonStyle.Danger,
  }

  const button = new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(styleMap[style] || ButtonStyle.Primary)
    .setDisabled(disabled)

  if (emoji) button.setEmoji(emoji)

  return button
}

export function createActionRow(...components) {
  return new ActionRowBuilder().addComponents(...components)
}
