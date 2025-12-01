import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from 'http-status-codes'
import { AuthServices } from "./auth.service";

const login = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const user = await AuthServices.login(req.body)
    sendResponse(res,{
        statusCode: httpCodes.CREATED,
        success: true,
        message: "User Loggedin Successfully!",
        data:user
    })
})

export const AuthController = {
    login
}