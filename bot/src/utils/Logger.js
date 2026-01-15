const chalk = require("chalk")

class Logger {
  static getTimestamp() {
    return new Date().toISOString().replace("T", " ").split(".")[0]
  }

  static info(message) {
    console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.blue("[INFO]")} ${message}`)
  }

  static success(message) {
    console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.green("[SUCCESS]")} ${message}`)
  }

  static warn(message) {
    console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.yellow("[WARN]")} ${message}`)
  }

  static error(message) {
    console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.red("[ERROR]")} ${message}`)
  }

  static debug(message) {
    if (process.env.NODE_ENV === "development") {
      console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.magenta("[DEBUG]")} ${message}`)
    }
  }

  static command(user, command, guild) {
    console.log(`${chalk.gray(`[${this.getTimestamp()}]`)} ${chalk.cyan("[CMD]")} ${user} used /${command} in ${guild}`)
  }
}

module.exports = Logger
