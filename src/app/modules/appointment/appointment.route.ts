import express from "express";
import { AppointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.post("/create-appointment", auth(UserRole.PATIENT), AppointmentControllers.createAppointment);
router.patch("/status/:id", auth(UserRole.DOCTOR, UserRole.ADMIN), AppointmentControllers.updateAppointmentStatus);
router.get("/all-appointments", auth(UserRole.ADMIN), AppointmentControllers.getAllAppointments);
router.get("/my-appointments", auth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentControllers.getMyAppointments);

export const appointmentRouter = router;