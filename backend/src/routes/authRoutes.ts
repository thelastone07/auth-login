import type {Request, Response} from "express";
import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signupSchema = Joi.object({
    username : Joi.string().min(3).max(30).required(),
    email : Joi.string().email().required(),
    password : Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9]).*$")) // 1 upper case + 1 number
    .required(),
});

const loginSchema = Joi.object({
    username : Joi.string().required(),
    password : Joi.string().required(),
});

router.post("/googlogin", async (req: Request, res : Response)=> {
    const gToken =  req.body.token;
    
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({error : "Google Client ID is not configured."});
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken : gToken,
            audience : process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.email) {
            return res.status(400).json({error : "Google login failed : No Email found"});
        }

        const email = payload.email;
        const username = email;

        let user = await prisma.user.findUnique({where : {email}, 
        select : {id : true, username : true, email : true, createdAt : true}
        });
        let finalUser;
        if (!user) {
        const newUser = await prisma.user.create({
                data : {
                    username,
                    email,
                    passwordHash : null,
                    provider : "google",
                },
                select : {id : true, username : true, email : true, createdAt : true},
            });
            finalUser = newUser;
        } else {
            finalUser = user;
        }
        const token = jwt.sign(
            {userId : finalUser.id},
            process.env.JWT_SECRET!,
            {expiresIn : "1h"}
        );
        const session = await prisma.session.create({
            data : {
                userId : finalUser.id,
                token,
                expiresAt : new Date(Date.now() + 1000*60*60),
                createdAt : new Date(Date.now()),
            }
        });

        return res.json({
            message : "Login Successful",
            token,
            user : finalUser,
            sessionId : session.id,
        });

    } catch(err) {
        res.status(500).json({error : err});
    }
});


router.post("/login", async (req : Request, res: Response) => {
    try {
        const {error, value} = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({error : error.message || "Invalid Credentials in schema"});
        }

        const {username, password} = value;

        const user = await prisma.user.findFirst({
            where : {
                OR : [{username}, {email : username}],
            },
        });

        if (!user) {
            return res.status(401).json({error : "Invalid username/email"});
        }
        if (!user.passwordHash) {
            return res.status(500).json({error : "User had signed in using Google login earlier."})
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({error : "Invalid Password"});
        }

        const token = jwt.sign(
            {userId : user.id},
            process.env.JWT_SECRET!,
            {expiresIn : "1h"}
        );

        const session = await prisma.session.create({
            data : {
                userId : user.id,
                token,
                expiresAt : new Date(Date.now() + 1000*60*60),
                createdAt : new Date(Date.now()),
            }
        });

        const {passwordHash, ...safeUser} = user;

        return res.json({
            message : "Login Successful",
            token,
            user : safeUser,
            sessionId : session.id,
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({error : "Internal server error"});
    }
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


router.post("/logout", authMiddleware, async (req: Request, res: Response)=> {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(400).json({error : "No token provided"});
        }

        await prisma.session.deleteMany({
            where : {token},
        });

        return res.json({message : "Logged out successfully"});
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error : "Internal server error"});
    }
});

export default router;