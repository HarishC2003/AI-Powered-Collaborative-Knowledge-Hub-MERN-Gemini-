// server/config/db.js
const mongoose = require("mongoose");

let listenersAttached = false;

function attachConnectionLogs() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    const { host, name } = mongoose.connection;
    console.log(`✅ MongoDB connected: ${host}/${name}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err?.message || err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
  });
}

function printHelpfulHints(err, uri) {
  console.error("❌ Failed to connect to MongoDB.");
  console.error("Error:", err?.name, err?.message);

  if (err?.name === "MongooseServerSelectionError") {
    console.error(
      [
        "Possible causes:",
        "• IP not whitelisted (add your IP or 0.0.0.0/0 for dev).",
        "• DB username/password wrong in URI.",
        "• Password has special chars and needs URL encoding.",
        "• VPN/Firewall blocking MongoDB Atlas/Compose.",
        "• .env not loaded before connecting.",
      ].join("\n")
    );
  }

  const redacted =
    typeof uri === "string"
      ? uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")
      : "<missing>";
  console.error("MONGO_URI (redacted):", redacted);
}

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

  attachConnectionLogs();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      // If you have a separate db name
      ...(process.env.MONGO_DB_NAME ? { dbName: process.env.MONGO_DB_NAME } : {}),
    });
    // connected() will log
  } catch (err) {
    printHelpfulHints(err, uri);
    process.exit(1);
  }
};