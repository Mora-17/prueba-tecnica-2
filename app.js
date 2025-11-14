import express from "express";
import dotenv from "dotenv";
import { mongooseContecion } from "./src/config/db.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT; mongooseContecion();

export default app;