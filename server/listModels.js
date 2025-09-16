// listModels.js
require("dotenv").config();

if (typeof fetch !== "function") {
  global.fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

async function listModels() {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY, // ✅ correct header
        },
      }
    );

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Available models:\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
}

listModels();
