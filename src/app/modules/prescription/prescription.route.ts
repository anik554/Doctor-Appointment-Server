import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { prescriptionControllers } from "./prescription.controller";

const router = express.Router();

router.post("/create-prescription", auth(UserRole.DOCTOR), prescriptionControllers.createPrescription)
router.get("/my-prescription", auth(UserRole.PATIENT), prescriptionControllers.getMyPrescriptions)

export const prescriptionRouter = router;