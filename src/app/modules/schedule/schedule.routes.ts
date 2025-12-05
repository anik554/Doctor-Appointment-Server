import express from "express"
import { ScheduleController } from "./schedule.controller"

const router = express.Router()

router.post("/create-schedule", ScheduleController.createSchedule)
router.get("/doctor-schedules",ScheduleController.getScheduleForDoctor)
router.delete("/delete-schedule/:id",ScheduleController.deleteSchedule)

export const ScheduleRoutes = router