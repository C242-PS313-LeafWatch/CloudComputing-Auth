import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import Users from "./models/user_model.js";
import db from "./config/Database.js";  
import router from "./routes/index.js";
  

dotenv.config(); 

const app = express();  

const startServer = async () => {
  try {
    // Autentikasi koneksi ke database
    await db.authenticate();
    console.log("Connected to PostgreSQL Cloud SQL!");

    // Sinkronisasi database
    await db.sync({ alter: true }); // Hanya buat tabel jika belum ada, tanpa menghapus yang sudah ada
    console.log("Database has been synchronized");

    await Users.sync();

  } catch (error) {
    console.error("Failed to connect to database:", error.message);  
  }

  // Middleware
  app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(router);  

  app.listen(8080, () => console.log("Server running at port 8080"));
};

startServer();
