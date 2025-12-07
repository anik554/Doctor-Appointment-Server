import express from "express"
import { DoctorControllers } from "./doctor.controller";

const router = express.Router();

router.get("/doctor-list", DoctorControllers.getDoctorList)

export const doctorRouters = router;