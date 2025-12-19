import express from "express";
import { PaymentControllers } from "./payment.controller";

const router = express.Router();
router.post("/", PaymentControllers.handleWebHook)

export const paymentRouter = router;