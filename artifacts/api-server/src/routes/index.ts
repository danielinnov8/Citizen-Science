import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import authRouter from "./auth";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(agentRouter);
router.use(profilesRouter);

export default router;
