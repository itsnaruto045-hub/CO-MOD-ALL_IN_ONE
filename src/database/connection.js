import mongoose from "mongoose"

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("[DB] MongoDB connected")
  } catch (error) {
    console.error("[DB] Connection failed:", error)
    throw error
  }
}

mongoose.connection.on("error", (err) => {
  console.error("[DB] Connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("[DB] Disconnected from MongoDB")
})
