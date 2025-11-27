import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserServices } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import httpCodes from 'http-status-codes'

const createPatient = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const patient = await UserServices.createPatient(req.body)
    sendResponse(res,{
        statusCode: httpCodes.CREATED,
        success: true,
        message: "Patient Created Successfully!",
        data:patient
    })
})

export const UserController = {
    createPatient
}