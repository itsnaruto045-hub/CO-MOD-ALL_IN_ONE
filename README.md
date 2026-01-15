# SDF Discord Bot

A comprehensive Discord bot with economy, crypto, games, music, moderation, and anti-nuke features.

## Features

### Economy System (OWO-style)
- Wallet & bank system with deposits/withdrawals
- Daily, weekly, monthly rewards
- Work, hunt, beg, crime, rob commands
- User-to-user payments
- Leaderboards

### Crypto System (tip.cc-style)
- Multi-currency support (BTC, ETH, LTC, DOGE, etc.)
- Tip users with crypto
- Rain distribution
- Deposit addresses (simulated)
- Withdrawal with confirmation
- Live price checking
- Transaction history

### Games (15+ games)
- Coinflip, Dice, Slots
- Blackjack with full gameplay
- Roulette with multiple bet types
- Crash with multiplier
- Wheel of Fortune
- Scratch cards
- Duels (PvP betting)
- Towers (climbing game)
- High-Low guessing
- Russian Roulette
- Game statistics tracking

### Music System (Lavalink)
- YouTube, Spotify, SoundCloud support
- Audio filters (bassboost, nightcore, vaporwave, 8D, etc.)
- Queue management
- DJ role system
- Interactive now-playing controls
- 24/7 mode
- Lyrics fetching

### Moderation
- Warn, kick, ban, unban
- Timeout/untimeout
- Purge with filters
- Slowmode
- Warning management
- Mod logs

### Anti-Nuke Protection
- Real-time audit log monitoring
- Mass action detection
- Automatic permission stripping
- Quarantine roles
- Server lockdown
- Panic button
- Backup/restore

### AutoMod
- Anti-spam
- Anti-mass mention
- Anti-invite links
- Anti-links (with whitelist)
- Banned words filter
- Excessive caps detection

### Automation
- Welcome/goodbye messages
- Auto-roles
- Ticket system

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. Install dependencies: `npm install`
4. Deploy commands: `npm run deploy`
5. Start the bot: `npm start`

## Required Environment Variables

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
MONGODB_URI=your_mongodb_uri
OWNER_ID=your_discord_id

# Music (Lavalink)
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# Optional integrations
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

## Commands Overview

| Category | Commands |
|----------|----------|
| Economy | balance, daily, weekly, work, hunt, beg, crime, rob, deposit, withdraw, pay, leaderboard |
| Crypto | cryptobalance, tip, rain, deposit, withdraw, prices, transactions |
| Games | coinflip, dice, slots, blackjack, roulette, crash, wheel, scratch, duel, towers, highlow, russianroulette, gamestats |
| Music | play, skip, stop, pause, resume, queue, nowplaying, volume, shuffle, loop, filter, seek, lyrics, 247 |
| Moderation | warn, kick, ban, unban, timeout, untimeout, purge, slowmode, warnings, clearwarnings, modlogs |
| Anti-Nuke | antinuke, lockdown, panic, backup |
| AutoMod | automod |
| Config | welcome, goodbye, ticket |
| Utility | help, ping, serverinfo, userinfo, avatar |
| Owner | eval, reload, setbal, addbal, shutdown |

## Tech Stack

- discord.js v14
- MongoDB with Mongoose
- Shoukaku (Lavalink)
- Node.js 18+

## License

MIT
