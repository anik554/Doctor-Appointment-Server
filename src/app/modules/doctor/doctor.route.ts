import express from "express"
import { DoctorControllers } from "./doctor.controller";

const router = express.Router();

router.get("/doctor-list", DoctorControllers.getDoctorList);
router.patch("/update-doctor-profile/:id", DoctorControllers.updateDoctorProfile);

export const doctorRouters = router;