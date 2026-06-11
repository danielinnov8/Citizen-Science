import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import avatarRouter from "./avatar";
import billingRouter from "./billing";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(agentRouter);
router.use(profilesRouter);
router.use(avatarRouter);
router.use(billingRouter);
router.use(adminRouter);

export default router;
