import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from 'cookie-parser';
import { PaymentControllers } from './app/modules/payment/payment.controller';
import cron from 'node-cron';
import { AppointmentServices } from './app/modules/appointment/appointment.service';

const app: Application = express();
app.use("/webhook", express.raw({type: "application/json"}), PaymentControllers.handleWebHook)
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

cron.schedule('* * * * *', () => {
  try {
    console.log('node cron called at ', new Date(Date.now()));
    AppointmentServices.cancelUnpaidAppointments()
  } catch (error) {
    console.error(error)
  }
});

app.use("/api/v1", router)

app.get('/', (req: Request, res: Response) => {
    res.send({
        status: "success",
        message: `Server is Running at ${config.port}`,
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec..",
        timeStamp: new Date().toISOString()
    })
});


app.use(globalErrorHandler);

app.use(notFound);

export default app;