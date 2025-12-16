import { IJWTUserPayload } from './../../types/common.types';
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AppointmentServices } from './appointment.service';
import sendResponse from '../../shared/sendResponse';
import httpCodes from "http-status-codes";

const createAppointment = catchAsync(async(req:Request &{user?: IJWTUserPayload}, res:Response, next: NextFunction)=>{
    const user = req.user
    const result = await AppointmentServices.createAppointment(user as IJWTUserPayload, req.body)

    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"Appointment Created Successfully",
        data:result
    })
})

export const AppointmentControllers ={
    createAppointment
}