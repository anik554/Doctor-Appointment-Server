import express from "express"
import { ScheduleController } from "./schedule.controller"

const router = express.Router()

router.post("/schedule", ScheduleController.createSchedule)

export const ScheduleRoutes = router