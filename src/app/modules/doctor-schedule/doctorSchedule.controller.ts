import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes"
import { IJWTUserPayload } from "../../types/common.types";

const createDoctorSchedule =catchAsync(async(req:Request & {user?:IJWTUserPayload}, res:Response, next:NextFunction)=>{
    const userData = req.user;
    const result = await DoctorScheduleServices.createDoctorSchedule(userData as IJWTUserPayload,req.body)

    sendResponse(res,{
        statusCode : httpCodes.CREATED,
        success: true,
        message:"Doctor Schedule Created Successfully",
        data:result
    })
})

export const DoctorScheduleControllers ={
    createDoctorSchedule
}