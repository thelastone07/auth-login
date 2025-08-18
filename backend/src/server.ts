import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.get("/protected", authMiddleware, (req,res)=> {
    res.json({message : "This route is protected", user : (req as any).user})
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});