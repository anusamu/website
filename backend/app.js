require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

// Database Connection
connectDB();

// Middleware

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

console.log("CLIENT_URL:", process.env.CLIENT_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming Origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Test Route
app.get("/", (req, res) => {
  res.send("E-Commerce API Running...");
});

// Routes
const Routes = require("./routes/routes");
app.use("/api", Routes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});