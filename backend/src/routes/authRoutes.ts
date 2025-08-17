import type {Request, Response} from "express";
import express from "express";
import bcrypt from "bcrypt";
import * as Joi from "joi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const signupSchema = Joi.object({
    username : Joi.string().min(3).max(30).required(),
    email : Joi.string.email().required(),
})