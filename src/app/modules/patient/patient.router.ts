import express from "express";
import { PatientControllers } from "./patient.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", PatientControllers.getAllPatients);
router.get("/:id", PatientControllers.getPatientById);
router.patch("/:id", auth(UserRole.PATIENT), PatientControllers.updatePatient);
router.delete("/soft/:id", PatientControllers.softDelete);

export const patientRoutes = router;
