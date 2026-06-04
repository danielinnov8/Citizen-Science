import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(agentRouter);

export default router;
