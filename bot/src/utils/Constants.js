module.exports = {
  // Economy constants
  ECONOMY: {
    STARTING_BALANCE: 1000,
    DAILY_AMOUNT: 500,
    WEEKLY_AMOUNT: 5000,
    MONTHLY_AMOUNT: 25000,
    MAX_WALLET: 1e15,
    MAX_BANK: 1e18,
    WORK_MIN: 100,
    WORK_MAX: 500,
    HUNT_MIN: 50,
    HUNT_MAX: 800,
    BEG_MIN: 10,
    BEG_MAX: 200,
    CRIME_MIN: 500,
    CRIME_MAX: 5000,
    CRIME_FINE_MIN: 200,
    CRIME_FINE_MAX: 2000,
    ROB_SUCCESS_RATE: 40,
    ROB_MAX_PERCENTAGE: 30,
    DEPOSIT_FEE: 0,
    WITHDRAW_FEE: 0,
    INTEREST_RATE: 0.1,
    ALT_DETECTION_THRESHOLD: 3,
  },

  // Cooldowns (in milliseconds)
  COOLDOWNS: {
    DAILY: 86400000, // 24 hours
    WEEKLY: 604800000, // 7 days
    MONTHLY: 2592000000, // 30 days
    WORK: 60000, // 1 minute
    HUNT: 30000, // 30 seconds
    BEG: 45000, // 45 seconds
    CRIME: 300000, // 5 minutes
    ROB: 600000, // 10 minutes
    SLOTS: 5000, // 5 seconds
    COINFLIP: 3000, // 3 seconds
    BLACKJACK: 10000, // 10 seconds
    CRYPTO_TIP: 5000, // 5 seconds
    CRYPTO_RAIN: 300000, // 5 minutes
  },

  // Crypto constants
  CRYPTO: {
    SUPPORTED: ["BTC", "ETH", "LTC", "DOGE", "USDT"],
    MIN_TIP: {
      BTC: 0.00001,
      ETH: 0.0001,
      LTC: 0.001,
      DOGE: 1,
      USDT: 0.01,
    },
    RAIN_MIN_USERS: 3,
    RAIN_MAX_USERS: 50,
    CONFIRMATION_REQUIRED: 1,
  },

  // Anti-nuke thresholds
  ANTINUKE: {
    BAN_THRESHOLD: 3,
    KICK_THRESHOLD: 5,
    CHANNEL_DELETE_THRESHOLD: 3,
    ROLE_DELETE_THRESHOLD: 3,
    WEBHOOK_CREATE_THRESHOLD: 3,
    TIME_WINDOW: 10000, // 10 seconds
    QUARANTINE_DURATION: 86400000, // 24 hours
  },

  // Music constants
  MUSIC: {
    MAX_QUEUE_SIZE: 500,
    MAX_PLAYLIST_SIZE: 100,
    DISCONNECT_TIMEOUT: 300000, // 5 minutes
    DEFAULT_VOLUME: 80,
  },

  // Game constants
  GAMES: {
    SLOTS_SYMBOLS: ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "🎰"],
    BLACKJACK_DECK: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    ROULETTE_NUMBERS: Array.from({ length: 37 }, (_, i) => i),
    WHEEL_MULTIPLIERS: [0.1, 0.2, 0.5, 1, 1.2, 1.5, 2, 3, 5, 10],
  },

  // Embed colors
  COLORS: {
    PRIMARY: 0x00ff00,
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    WARNING: 0xffaa00,
    INFO: 0x00aaff,
    ECONOMY: 0xffd700,
    CRYPTO: 0xf7931a,
    MUSIC: 0x1db954,
    GAME: 0x9b59b6,
  },
}
