import type {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import type {JwtPayload as BaseJwtPayload} from "jsonwebtoken";
import { error } from "console";

// middleware that is responsible for authentication
// ? means optional
// the middleware adds new data to the req body and sends to the main handler


const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user ?: {id : string};
}

interface CustomJwtPayload extends BaseJwtPayload{
    userId : string;
}

export function authMiddleware(req : Request, res : Response, next : NextFunction) {
    try {
        const authHeader  = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({error: "No token provided"});
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({error : "Invalid Token Format"});
        }

        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret);
        
        if (typeof decoded === 'object' && decoded && 'userId' in decoded) {
            const payload = decoded as CustomJwtPayload;
            (req as AuthRequest).user = {id : payload.userId};
            next();
        }
        else {
            return res.status(401).json({error : "Invalid token payload"});
        }
        
    }
    catch (err) {
        if (error.name=='TokenExpiredError') return res.status(401).json({error: "Token Expired. Please log in again."})
        return res.status(403).json({error : "Invalid token"});
    }
}

export async function requireAuth(req : AuthRequest, res : Response, next : NextFunction) {
    try {

        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({error : "Authorization header missing or invalid"});
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({error : "Token not found"});
        }
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret);

        if (typeof decoded === 'object' && decoded && 'userId' in decoded) {
            const payload = decoded as CustomJwtPayload;

            const session = await prisma.session.findFirst({
                where : {token : token},
                include : {user : true},
            });

            if (!session || session.expiresAt < new Date()) {
                return res.status(401).json({error : "invalid session or session expired"});
            } 
            req.user = {id : payload.userId};
            next();
        }
        else {
            return res.status(401).json({error : "invalid token payload"});
        }

    } catch (err) {
        console.error("Auth error", err);
        if (error.name=='TokenExpiredError') return res.status(401).json({error: "Token Expired. Please log in again."})
        return res.status(403).json({error : "Invalid token"});
    }
}