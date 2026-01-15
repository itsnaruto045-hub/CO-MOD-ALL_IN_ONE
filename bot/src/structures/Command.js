class Command {
  constructor(client, options = {}) {
    this.client = client
    this.name = options.name || null
    this.description = options.description || "No description provided"
    this.category = options.category || "Misc"
    this.options = options.options || []
    this.cooldown = options.cooldown || 3000
    this.ownerOnly = options.ownerOnly || false
    this.permissions = options.permissions || []
    this.botPermissions = options.botPermissions || []
    this.nsfw = options.nsfw || false
    this.enabled = options.enabled !== false
  }

  async run(interaction) {
    throw new Error(`Command ${this.name} does not have a run method`)
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      options: this.options,
      dm_permission: false,
    }
  }
}

module.exports = Command
