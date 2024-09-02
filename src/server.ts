import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
// import mongoose from "mongoose";
import connectDB from "./config/db";
// import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import linkRoutes from "./routes/linkRoutes";
import userRoutes from "./routes/userRoutes";
import logger from "./utils/logger";
import client from "./config/db";

dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
// connectDB();

//making connection to Postgres
client.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Connection error', err.stack));

app.get("/", (_req:Request, res: Response):any => {
  logger.info("Home route accessed");
  // res.status(200).send("Hello, World!");
   res.send("hello ");
  
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/auth", authRoutes);

app.get("/error", (req: Request, res: Response) => {
  try {
    throw new Error("An intentional error");
  } catch (error: any) {
    logger.error("Error on /error route: " + error.message);
    logger.error(
      `${res.status || 500} - ${error.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
    res.status(500).send("Something went wrong!");
  }
});

app.listen(8001||process.env.PORT ,()=>{
  console.log(`Server is running on port ${process.env.PORT}`);
})
