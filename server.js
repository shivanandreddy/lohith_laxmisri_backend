import dotenv from "dotenv";
dotenv.config();
import express from "express";

import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import settingsRoutes from "./routes/setting.routes.js";
import productRoutes from "./routes/product.routes.js";



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API server is running",
  });
});

// Error handler for unexpected errors
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
}

startServer();
