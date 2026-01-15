const mongoose = require("mongoose")

const gameStatsSchema = new mongoose.Schema(
  {
    odId: { type: String, required: true },
    guildId: { type: String, required: true },
    games: {
      coinflip: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
      },
      slots: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
        jackpots: { type: Number, default: 0 },
      },
      blackjack: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
      },
      dice: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
      },
      roulette: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
      },
      crash: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
        highestMultiplier: { type: Number, default: 0 },
      },
      wheel: { spins: { type: Number, default: 0 }, profit: { type: Number, default: 0 } },
      scratch: { cards: { type: Number, default: 0 }, profit: { type: Number, default: 0 } },
      duel: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 } },
      fight: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 } },
    },
    totalGamesPlayed: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    biggestWin: { type: Number, default: 0 },
    biggestLoss: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
  },
  { timestamps: true },
)

gameStatsSchema.index({ odId: 1, guildId: 1 }, { unique: true })

module.exports = mongoose.model("GameStats", gameStatsSchema)
