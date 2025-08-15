import type {Request, Response} from "express";

export function getHello(req : Request, res : Response) {
    res.send("Hello from Express + TypeScript");
}