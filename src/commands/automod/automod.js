const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const Guild = require("../../database/schemas/Guild")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Configure automod settings")
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable automod"))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable automod"))
    .addSubcommand((sub) =>
      sub
        .setName("antispam")
        .setDescription("Configure anti-spam")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable/disable").setRequired(true))
        .addIntegerOption((opt) =>
          opt.setName("threshold").setDescription("Messages before trigger").setMinValue(3).setMaxValue(20),
        )
        .addStringOption((opt) =>
          opt
            .setName("action")
            .setDescription("Action to take")
            .addChoices(
              { name: "Delete only", value: "delete" },
              { name: "Timeout", value: "timeout" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" },
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("antimention")
        .setDescription("Configure anti-mass mention")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable/disable").setRequired(true))
        .addIntegerOption((opt) =>
          opt.setName("threshold").setDescription("Mentions before trigger").setMinValue(3).setMaxValue(20),
        )
        .addStringOption((opt) =>
          opt
            .setName("action")
            .setDescription("Action to take")
            .addChoices(
              { name: "Delete only", value: "delete" },
              { name: "Timeout", value: "timeout" },
              { name: "Kick", value: "kick" },
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("antiinvite")
        .setDescription("Configure anti-invite links")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable/disable").setRequired(true))
        .addStringOption((opt) =>
          opt
            .setName("action")
            .setDescription("Action to take")
            .addChoices({ name: "Delete only", value: "delete" }, { name: "Timeout", value: "timeout" }),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("antilink")
        .setDescription("Configure anti-link")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable/disable").setRequired(true))
        .addStringOption((opt) => opt.setName("whitelist").setDescription("Whitelisted domains (comma separated)")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("bannedwords")
        .setDescription("Configure banned words")
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable/disable").setRequired(true))
        .addStringOption((opt) => opt.setName("words").setDescription("Banned words (comma separated)")),
    )
    .addSubcommand((sub) => sub.setName("status").setDescription("View current automod configuration"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const guildData =
      (await Guild.findOne({ guildId: interaction.guild.id })) ||
      (await Guild.create({ guildId: interaction.guild.id }))

    if (!guildData.automod) guildData.automod = {}

    switch (subcommand) {
      case "enable":
        guildData.automod.enabled = true
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0x6bff6b).setDescription("AutoMod has been enabled.")],
        })

      case "disable":
        guildData.automod.enabled = false
        await guildData.save()
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor(0xff6b6b).setDescription("AutoMod has been disabled.")],
        })

      case "antispam":
        guildData.automod.antiSpam = {
          enabled: interaction.options.getBoolean("enabled"),
          threshold: interaction.options.getInteger("threshold") || 5,
          action: interaction.options.getString("action") || "delete",
        }
        await guildData.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(`Anti-spam ${guildData.automod.antiSpam.enabled ? "enabled" : "disabled"}.`),
          ],
        })

      case "antimention":
        guildData.automod.antiMention = {
          enabled: interaction.options.getBoolean("enabled"),
          threshold: interaction.options.getInteger("threshold") || 5,
          action: interaction.options.getString("action") || "delete",
        }
        await guildData.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(`Anti-mention ${guildData.automod.antiMention.enabled ? "enabled" : "disabled"}.`),
          ],
        })

      case "antiinvite":
        guildData.automod.antiInvite = {
          enabled: interaction.options.getBoolean("enabled"),
          action: interaction.options.getString("action") || "delete",
        }
        await guildData.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(`Anti-invite ${guildData.automod.antiInvite.enabled ? "enabled" : "disabled"}.`),
          ],
        })

      case "antilink":
        const whitelist = interaction.options.getString("whitelist")
        guildData.automod.antiLink = {
          enabled: interaction.options.getBoolean("enabled"),
          whitelist: whitelist ? whitelist.split(",").map((w) => w.trim()) : [],
        }
        await guildData.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(`Anti-link ${guildData.automod.antiLink.enabled ? "enabled" : "disabled"}.`),
          ],
        })

      case "bannedwords":
        const words = interaction.options.getString("words")
        guildData.automod.bannedWords = {
          enabled: interaction.options.getBoolean("enabled"),
          words: words ? words.split(",").map((w) => w.trim()) : [],
          action: "delete",
        }
        await guildData.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setDescription(`Banned words ${guildData.automod.bannedWords.enabled ? "enabled" : "disabled"}.`),
          ],
        })

      case "status":
        const config = guildData.automod
        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("AutoMod Configuration")
          .addFields(
            { name: "Status", value: config.enabled ? "Enabled" : "Disabled", inline: true },
            {
              name: "Anti-Spam",
              value: config.antiSpam?.enabled ? `Enabled (${config.antiSpam.threshold} msgs)` : "Disabled",
              inline: true,
            },
            {
              name: "Anti-Mention",
              value: config.antiMention?.enabled ? `Enabled (${config.antiMention.threshold} mentions)` : "Disabled",
              inline: true,
            },
            { name: "Anti-Invite", value: config.antiInvite?.enabled ? "Enabled" : "Disabled", inline: true },
            { name: "Anti-Link", value: config.antiLink?.enabled ? "Enabled" : "Disabled", inline: true },
            {
              name: "Banned Words",
              value: config.bannedWords?.enabled
                ? `Enabled (${config.bannedWords.words?.length || 0} words)`
                : "Disabled",
              inline: true,
            },
          )
          .setTimestamp()
        return interaction.reply({ embeds: [embed] })
    }
  },
}
