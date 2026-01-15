const Logger = require("../utils/Logger")

module.exports = {
  once: true,
  async execute(client) {
    Logger.success(`Logged in as ${client.user.tag}`)
    Logger.info(`Serving ${client.guilds.cache.size} guilds`)
    Logger.info(`Watching ${client.users.cache.size} users`)

    // Set presence
    client.user.setPresence({
      activities: [
        {
          name: "/help | % SDF >..",
          type: 3, // Watching
        },
      ],
      status: "online",
    })

    // Rotate status every 30 seconds
    setInterval(() => {
      const statuses = [
        { name: "/help | % SDF >..", type: 3 },
        { name: `${client.guilds.cache.size} servers`, type: 3 },
        { name: `${client.users.cache.size} users`, type: 3 },
        { name: "economy & games", type: 0 },
        { name: "crypto trading", type: 0 },
      ]

      const status = statuses[Math.floor(Math.random() * statuses.length)]
      client.user.setActivity(status.name, { type: status.type })
    }, 30000)
  },
}
