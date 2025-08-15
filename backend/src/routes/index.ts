import {Router} from "express";
import { getHello } from "../controllers/exampleController.js";

const router = Router();

router.get("/",getHello);

export default router;


