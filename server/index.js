require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors"); // <-- add this

app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/docs", require("./routes/docs"));
app.use("/api/qna", require("./routes/qna"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/versions", require("./routes/versions"));
app.use("/api/search", require("./routes/search")); // if you have it

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));