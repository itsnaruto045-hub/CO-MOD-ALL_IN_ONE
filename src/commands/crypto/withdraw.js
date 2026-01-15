import { SlashCommandBuilder } from "discord.js"
import { createTerminalEmbed, createButton, createActionRow } from "../../utils/embed.js"

export default {
  data: new SlashCommandBuilder()
    .setName("cryptowithdraw")
    .setDescription("Withdraw crypto to an external address")
    .addStringOption((opt) =>
      opt
        .setName("coin")
        .setDescription("Cryptocurrency")
        .setRequired(true)
        .addChoices(
          { name: "Bitcoin (BTC)", value: "BTC" },
          { name: "Ethereum (ETH)", value: "ETH" },
          { name: "Litecoin (LTC)", value: "LTC" },
          { name: "Tether (USDT)", value: "USDT" },
          { name: "Dogecoin (DOGE)", value: "DOGE" },
        ),
    )
    .addNumberOption((opt) =>
      opt.setName("amount").setDescription("Amount to withdraw").setRequired(true).setMinValue(0.0001),
    )
    .addStringOption((opt) => opt.setName("address").setDescription("Destination wallet address").setRequired(true)),

  async execute(interaction, client) {
    const odbc = interaction.user.id
    const coin = interaction.options.getString("coin")
    const amount = interaction.options.getNumber("amount")
    const address = interaction.options.getString("address")

    const balance = await client.crypto.getBalance(odbc, coin)
    const info = client.crypto.getCoinInfo(coin)

    if (balance < amount) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "INSUFFICIENT BALANCE",
            description: `You have ${info.symbol} ${client.crypto.formatAmount(balance, coin)} ${coin}`,
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    // Network fee simulation
    const fees = {
      BTC: 0.0001,
      ETH: 0.002,
      LTC: 0.001,
      USDT: 1,
      DOGE: 1,
    }
    const fee = fees[coin]
    const totalNeeded = amount + fee

    if (balance < totalNeeded) {
      return interaction.reply({
        embeds: [
          createTerminalEmbed({
            title: "INSUFFICIENT FOR FEE",
            description: [
              `Amount: ${info.symbol} ${amount}`,
              `Fee:    ${info.symbol} ${fee}`,
              `Total:  ${info.symbol} ${totalNeeded}`,
              ``,
              `Your balance: ${info.symbol} ${client.crypto.formatAmount(balance, coin)}`,
            ].join("\n"),
            color: client.config.colors.error,
          }),
        ],
        ephemeral: true,
      })
    }

    // Confirmation embed with buttons
    const confirmEmbed = createTerminalEmbed({
      title: "CONFIRM WITHDRAWAL",
      description: [
        `┌─ WITHDRAWAL DETAILS ──────┐`,
        `│ Coin:    ${coin}`,
        `│ Amount:  ${info.symbol} ${client.crypto.formatAmount(amount, coin)}`,
        `│ Fee:     ${info.symbol} ${fee}`,
        `│ Total:   ${info.symbol} ${client.crypto.formatAmount(totalNeeded, coin)}`,
        `├───────────────────────────┤`,
        `│ To: ${address.slice(0, 20)}...`,
        `└───────────────────────────┘`,
        ``,
        `Please confirm this withdrawal.`,
      ].join("\n"),
      color: client.config.colors.warning,
    })

    const row = createActionRow(
      createButton({ id: "confirm_withdraw", label: "Confirm", style: "success" }),
      createButton({ id: "cancel_withdraw", label: "Cancel", style: "danger" }),
    )

    const response = await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true,
    })

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: (i) => i.user.id === odbc,
        time: 60000,
      })

      if (confirmation.customId === "confirm_withdraw") {
        await client.crypto.removeCrypto(odbc, coin, totalNeeded)

        // Generate fake tx hash
        const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

        await confirmation.update({
          embeds: [
            createTerminalEmbed({
              title: "WITHDRAWAL PROCESSING",
              description: [
                `┌─ TRANSACTION SUBMITTED ───┐`,
                `│ Amount: ${info.symbol} ${client.crypto.formatAmount(amount, coin)}`,
                `│ Fee:    ${info.symbol} ${fee}`,
                `├───────────────────────────┤`,
                `│ TX: ${txHash.slice(0, 16)}...`,
                `│ Status: PENDING`,
                `└───────────────────────────┘`,
                ``,
                `Processing time: ~10-30 minutes`,
              ].join("\n"),
              color: client.config.colors.success,
            }),
          ],
          components: [],
        })
      } else {
        await confirmation.update({
          embeds: [
            createTerminalEmbed({
              title: "WITHDRAWAL CANCELLED",
              description: "Transaction cancelled by user.",
              color: client.config.colors.error,
            }),
          ],
          components: [],
        })
      }
    } catch {
      await interaction.editReply({
        embeds: [
          createTerminalEmbed({
            title: "TIMEOUT",
            description: "Confirmation timed out.",
            color: client.config.colors.error,
          }),
        ],
        components: [],
      })
    }
  },
}
