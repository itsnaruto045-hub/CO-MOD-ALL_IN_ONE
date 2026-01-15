const Command = require("../../structures/Command")
const SDFEmbed = require("../../structures/Embed")
const Helpers = require("../../utils/Helpers")
const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { COOLDOWNS } = require("../../utils/Constants")

class BlackjackCommand extends Command {
  constructor(client) {
    super(client, {
      name: "blackjack",
      description: "Play blackjack against the dealer",
      category: "Games",
      options: [
        {
          name: "bet",
          description: "Amount to bet",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 10,
        },
      ],
      cooldown: COOLDOWNS.BLACKJACK,
    })
  }

  getCardValue(card) {
    if (["J", "Q", "K"].includes(card)) return 10
    if (card === "A") return 11
    return Number.parseInt(card)
  }

  calculateHand(cards) {
    let total = cards.reduce((sum, card) => sum + this.getCardValue(card), 0)
    let aces = cards.filter((c) => c === "A").length

    while (total > 21 && aces > 0) {
      total -= 10
      aces--
    }
    return total
  }

  createDeck() {
    const suits = ["♠", "♥", "♦", "♣"]
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    const deck = []

    for (const suit of suits) {
      for (const value of values) {
        deck.push(value)
      }
    }
    return Helpers.shuffle(deck)
  }

  async run(interaction) {
    const bet = interaction.options.getInteger("bet")
    const guildId = interaction.guild?.id || "global"

    const balance = await this.client.economyManager.getBalance(interaction.user.id, guildId)

    if (balance.wallet < bet) {
      return interaction.reply({
        embeds: [SDFEmbed.error("Insufficient balance")],
        ephemeral: true,
      })
    }

    await this.client.economyManager.removeMoney(interaction.user.id, guildId, bet, "wallet", "Blackjack bet")

    const deck = this.createDeck()
    const playerHand = [deck.pop(), deck.pop()]
    const dealerHand = [deck.pop(), deck.pop()]

    const gameId = `bj_${interaction.user.id}_${Date.now()}`

    const createEmbed = (showDealer = false, status = "playing") => {
      const playerTotal = this.calculateHand(playerHand)
      const dealerTotal = this.calculateHand(dealerHand)

      return new SDFEmbed()
        .setTitle("`[ BLACKJACK ]`")
        .setDescription(`\`\`\`ansi
\u001b[0;32m╔══════════════════════════════╗
║  Dealer: ${showDealer ? dealerHand.join(" ") : dealerHand[0] + " ?"} (${showDealer ? dealerTotal : "?"})${" ".repeat(Math.max(0, 13 - (showDealer ? dealerHand.join(" ").length : 3)))}║
╠══════════════════════════════╣
║  You: ${playerHand.join(" ")} (${playerTotal})${" ".repeat(Math.max(0, 17 - playerHand.join(" ").length))}║
╠══════════════════════════════╣
║  Bet: ${Helpers.formatNumber(bet).padEnd(22)}║
╚══════════════════════════════╝
\`\`\``)
        .setColor(
          status === "playing" ? 0x00aaff : status === "win" ? 0x00ff00 : status === "lose" ? 0xff0000 : 0xffaa00,
        )
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`${gameId}_hit`).setLabel("Hit").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`${gameId}_stand`).setLabel("Stand").setStyle(ButtonStyle.Secondary),
    )

    const message = await interaction.reply({
      embeds: [createEmbed()],
      components: [row],
      fetchReply: true,
    })

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith(gameId),
      time: 60000,
    })

    collector.on("collect", async (i) => {
      const action = i.customId.split("_")[2]

      if (action === "hit") {
        playerHand.push(deck.pop())
        const playerTotal = this.calculateHand(playerHand)

        if (playerTotal > 21) {
          collector.stop("bust")
          await i.update({
            embeds: [
              createEmbed(true, "lose").setDescription(
                createEmbed(true, "lose").data.description.replace(
                  "╚",
                  "╠══════════════════════════════╣\n║  BUST! You lose!             ║\n╚",
                ),
              ),
            ],
            components: [],
          })
        } else if (playerTotal === 21) {
          collector.stop("blackjack")
        } else {
          await i.update({ embeds: [createEmbed()] })
        }
      } else if (action === "stand") {
        collector.stop("stand")
      }
    })

    collector.on("end", async (collected, reason) => {
      if (reason === "bust") return

      // Dealer draws
      while (this.calculateHand(dealerHand) < 17) {
        dealerHand.push(deck.pop())
      }

      const playerTotal = this.calculateHand(playerHand)
      const dealerTotal = this.calculateHand(dealerHand)

      let status,
        resultText,
        winnings = 0

      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        status = "win"
        winnings = bet * 2
        resultText = playerTotal === 21 && playerHand.length === 2 ? "BLACKJACK!" : "YOU WIN!"
        await this.client.economyManager.addMoney(interaction.user.id, guildId, winnings, "wallet", "Blackjack win")
      } else if (playerTotal < dealerTotal) {
        status = "lose"
        resultText = "DEALER WINS!"
      } else {
        status = "draw"
        winnings = bet
        resultText = "PUSH - Tie!"
        await this.client.economyManager.addMoney(interaction.user.id, guildId, bet, "wallet", "Blackjack push")
      }

      const finalEmbed = createEmbed(true, status)
      finalEmbed.setDescription(
        finalEmbed.data.description.replace("╚", `╠══════════════════════════════╣\n║  ${resultText.padEnd(27)}║\n╚`),
      )

      try {
        await message.edit({ embeds: [finalEmbed], components: [] })
      } catch (e) {}
    })
  }
}

module.exports = BlackjackCommand
