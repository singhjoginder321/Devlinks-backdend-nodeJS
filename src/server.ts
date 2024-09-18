import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import pclient from "prom-client"; //metrics collection 
// import mongoose from "mongoose";
import connectDB from "./config/db";
// import errorHandler from "./middleware/errorHandler";
import session from 'express-session';
import passport from 'passport';
import { cli } from "winston/lib/winston/config";
import client from "./config/db";
import "./config/passport-setup-github";
import "./config/passport-setup-google";
import authRoutes from "./routes/authRoutes";
import linkRoutes from "./routes/linkRoutes";
import userRoutes from "./routes/userRoutes";
import logger from "./utils/logger";


import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import query from './utils/query'; // Adjust the import path as necessary


dotenv.config();

// Initialize Express app
const app = express();
const collectDefaultMetrics  = pclient.collectDefaultMetrics;
collectDefaultMetrics({register: pclient.register});
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors({
  origin :"http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // allow session cookies over HTTP
}
));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
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

app.get("/metrics",  async(req : Request, res : Response) => {
  res.set('Content-Type', pclient.register.contentType);
  const metrics = await pclient.register.metrics();
  res.send(metrics);
})

app.listen(8001||process.env.PORT ,()=>{
  console.log(`Server is running on port ${process.env.PORT}`);
})
