const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all bot commands")
    .addStringOption((opt) => opt.setName("command").setDescription("Get info about a specific command")),

  async execute(interaction) {
    const commandName = interaction.options.getString("command")

    if (commandName) {
      const command = interaction.client.commands.get(commandName)
      if (!command) {
        return interaction.reply({ content: "Command not found.", ephemeral: true })
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`/${command.data.name}`)
        .setDescription(command.data.description)
        .setTimestamp()

      if (command.data.options?.length) {
        embed.addFields({
          name: "Options",
          value: command.data.options.map((opt) => `\`${opt.name}\` - ${opt.description}`).join("\n"),
        })
      }

      return interaction.reply({ embeds: [embed] })
    }

    const categories = {
      Economy: [
        "balance",
        "daily",
        "weekly",
        "work",
        "hunt",
        "beg",
        "crime",
        "rob",
        "deposit",
        "withdraw",
        "pay",
        "leaderboard",
      ],
      Crypto: ["cryptobalance", "tip", "rain", "deposit", "withdraw", "prices", "transactions"],
      Games: [
        "coinflip",
        "dice",
        "slots",
        "blackjack",
        "roulette",
        "crash",
        "wheel",
        "scratch",
        "duel",
        "towers",
        "highlow",
        "russianroulette",
        "gamestats",
      ],
      Music: [
        "play",
        "skip",
        "stop",
        "pause",
        "resume",
        "queue",
        "nowplaying",
        "volume",
        "shuffle",
        "loop",
        "filter",
        "seek",
        "lyrics",
        "247",
      ],
      Moderation: [
        "warn",
        "kick",
        "ban",
        "unban",
        "timeout",
        "untimeout",
        "purge",
        "slowmode",
        "warnings",
        "clearwarnings",
        "modlogs",
      ],
      "Anti-Nuke": ["antinuke", "lockdown", "panic", "backup"],
      AutoMod: ["automod"],
      Config: ["welcome", "goodbye", "ticket"],
      Utility: ["help", "ping", "serverinfo", "userinfo", "avatar"],
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Bot Commands")
      .setDescription("Select a category from the dropdown to view commands.")
      .addFields(
        Object.entries(categories).map(([name, cmds]) => ({
          name: name,
          value: `${cmds.length} commands`,
          inline: true,
        })),
      )
      .setFooter({ text: "Use /help <command> for detailed info" })
      .setTimestamp()

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help_category")
        .setPlaceholder("Select a category")
        .addOptions(
          Object.keys(categories).map((cat) => ({
            label: cat,
            value: cat.toLowerCase(),
            description: `View ${cat} commands`,
          })),
        ),
    )

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })

    const collector = msg.createMessageComponentCollector({ time: 60000 })

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "This menu is not for you.", ephemeral: true })
      }

      const category = Object.keys(categories).find((c) => c.toLowerCase() === i.values[0])
      const commands = categories[category]

      const categoryEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${category} Commands`)
        .setDescription(commands.map((c) => `\`/${c}\``).join(", "))
        .setTimestamp()

      await i.update({ embeds: [categoryEmbed] })
    })
  },
}
