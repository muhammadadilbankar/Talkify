import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

// ✅ Increase the size limit for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' })); // Increase limit to 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}
))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})