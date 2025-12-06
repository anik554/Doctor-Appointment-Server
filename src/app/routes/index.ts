import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRouters } from '../modules/auth/auth.routes';
import { ScheduleRoutes } from '../modules/schedule/schedule.routes';
import { doctorScheduleRouters } from '../modules/doctor-schedule/doctorSchedule.routes';
import { specialitiesRouters } from '../modules/specialities/specialities.route';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: authRouters
    },
    {
        path: '/schedule',
        route: ScheduleRoutes
    },
    {
        path: '/doctor-schedule',
        route: doctorScheduleRouters
    },
    {
        path: '/specialities',
        route: specialitiesRouters
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;