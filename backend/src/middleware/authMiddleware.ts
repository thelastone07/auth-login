import type {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId : String;
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
        const decoded = jwt.verify(token, secret) as JwtPayload;

        (req as any).user = {id : decoded.userId};


        next();
    }
    catch (err) {
        return res.status(403).json({error : "Invalid or expired token"});
    }
}