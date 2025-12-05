import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRouters } from '../modules/auth/auth.routes';
import { ScheduleRoutes } from '../modules/schedule/schedule.routes';


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
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;