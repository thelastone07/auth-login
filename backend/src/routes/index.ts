import {Router} from "express";
import { getHello } from "../controllers/exampleController.js";

const router = Router();

router.get("/",getHello);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;


