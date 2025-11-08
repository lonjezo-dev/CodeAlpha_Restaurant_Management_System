// index.js
import express  from "express";
import { sequelize }  from "./config/database.mjs";
import cors  from "cors"; 
import apiRoutes from "./routes.mjs";

const app = express();
const port = process.env.PORT || 3001;

// Add CORS middleware
app.use(cors({
  origin: "*", // Allow all origins for testing
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint (required for Render)
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: "OK", 
      database: "Connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Database Error",
      error: error.message 
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🍽️ Restaurant Management System API",
    version: "1.0.0",
    health: "/health",
    docs: "/api/menu-items"
  });
});

const initApp = async () => {
   try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully.");

      // Sync all models
      await sequelize.sync();

      console.log("✅ All models synchronized successfully.");

     // Mount API routes
     app.use('/api',apiRoutes );

     app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server listening on port ${port}`);
        console.log(`📍 Local: http://localhost:${port}`);
        console.log(`❤️  Health: http://localhost:${port}/health`);
        console.log(`📚 API: http://localhost:${port}/api`);
     });
   } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
      process.exit(1);
   }
}

initApp();