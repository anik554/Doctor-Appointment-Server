import express from "express"
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.post("/create-doctor-schedule", auth(UserRole.DOCTOR), DoctorScheduleControllers.createDoctorSchedule)

export const doctorScheduleRouters = router;