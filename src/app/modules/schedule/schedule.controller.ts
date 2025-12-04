import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes"
import { ScheduleServices } from "./schedule.services";

const createSchedule = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const result = await ScheduleServices.createSchedule(req.body)

    sendResponse(res,{
        statusCode : httpCodes.CREATED,
        success: true,
        message:"Schedule Created Successfully",
        data:result
    })
})

export const ScheduleController ={
    createSchedule
}