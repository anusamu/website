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
  'http://localhost:5173', // For local development
  'https://website-rg-handloom.vercel.app', // Production frontend (no trailing slash)
  'https://website-cj3wrxesh-rg-handloom.vercel.app' // The specific preview URL you are testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list, OR if it's a Vercel preview URL
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('-rg-handloom.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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