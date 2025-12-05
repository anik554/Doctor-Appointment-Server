import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes"
import { ScheduleServices } from "./schedule.services";
import pick from "../../helpers/pick";

const createSchedule = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const result = await ScheduleServices.createSchedule(req.body)

    sendResponse(res,{
        statusCode : httpCodes.CREATED,
        success: true,
        message:"Schedule Created Successfully",
        data:result
    })
})

const getScheduleForDoctor = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const options = pick(req.query,["page","limit","sortBy","sortOrder"])
    const filters = pick(req.query, ["startDateTime","endDateTime"])

    const result = await ScheduleServices.getScheduleForDoctor(options,filters)

    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"Doctor Schedules Retrived Successfully",
        meta:result.meta,
        data:result.data
    })
})

const deleteSchedule =catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const scheduleId= req.params.id
    const result = await ScheduleServices.deleteSchedule(scheduleId)
    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"Schedule Deleted Successfully",
        data:result
    })
})

export const ScheduleController ={
    createSchedule,
    getScheduleForDoctor,
    deleteSchedule
}