import type {Request, Response} from "express";
import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const signupSchema = Joi.object({
    username : Joi.string().min(3).max(30).required(),
    email : Joi.string().email().required(),
    password : Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9]).*$")) // 1 upper case + 1 number
    .required(),
});

router.post("/register", async (req : Request, res : Response) => {
    try {
        const {error, value} = signupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({error : error.message || "Validation error"});
        }

        const {username, email, password} = value;

        const existingUser = await prisma.user.findFirst({
            where : {
                OR : [{username}, {email}],
            },
        });

        if (existingUser) {
            return res.status(409).json({error : "Username or email already taken"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await prisma.user.create({
            data : {
                username,
                email,
                passwordHash : hashedPassword,
            },
            select : {id : true, username : true, email : true, createdAt : true},
        });

        return res.status(201).json({message : "user registered successfully", user : newUser});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error : "internal server error"});
    }
});

export default router;