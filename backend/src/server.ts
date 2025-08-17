import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middleware/authMiddleware.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api",router);

app.use(errorHandler);

app.get("/protected", authMiddleware, (req,res)=> {
    res.json({message : "This route is protected", user : (req as any).user})
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});