import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

const createPatient = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    console.log("patients: ",req.body)
})

export const UserController = {
    createPatient
}