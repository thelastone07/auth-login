import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api",router);

app.use(errorHandler);

app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.post("/users", async (req, res) => {
    const {email, name} = req.body;
    const user = await prisma.user.create({
        data : {email,name}
    });
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});