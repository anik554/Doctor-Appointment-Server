import express from "express";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validationRequest from "../../middlewares/validateRequest";
import { DoctorScheduleZodValidations } from "./doctorSchedule.validation";

const router = express.Router();
router.post(
  "/create-doctor-schedule",
  auth(UserRole.DOCTOR),
  validationRequest(
    DoctorScheduleZodValidations.createDoctorScheduleZodValidation
  ),
  DoctorScheduleControllers.createDoctorSchedule
);

export const doctorScheduleRouters = router;
