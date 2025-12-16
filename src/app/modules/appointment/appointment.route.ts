import express from "express";
import { AppointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.post("/create-appointment", auth(UserRole.PATIENT), AppointmentControllers.createAppointment)

export const appointmentRouter = router