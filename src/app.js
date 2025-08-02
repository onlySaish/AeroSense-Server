import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

// Import Routers
import userRouter from "./routes/user.router.js"
import homeRouter from "./routes/home.router.js"

app.use("/api/v1/users",userRouter);
app.use("/api/v1/home",homeRouter);

app.use(errorHandler);
export {app}