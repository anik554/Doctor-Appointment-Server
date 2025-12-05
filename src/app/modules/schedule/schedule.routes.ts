import express from "express"
import { ScheduleController } from "./schedule.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.post("/create-schedule", ScheduleController.createSchedule)
router.get("/doctor-schedules",auth(UserRole.ADMIN,UserRole.DOCTOR),ScheduleController.getScheduleForDoctor)
router.delete("/delete-schedule/:id",ScheduleController.deleteSchedule)

export const ScheduleRoutes = router