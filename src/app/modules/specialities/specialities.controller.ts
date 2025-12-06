import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { SpecialitiesServices } from "./specialities.service";
import sendResponse from "../../shared/sendResponse";

const createSpecialities = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await SpecialitiesServices.createSpecialities(req)
    console.log({result})

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success:true,
        message:"Specialities Created Successfully",
        data:result
    })
})

const getAllSpecialities = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await SpecialitiesServices.getAllSpecialities()

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success:true,
        message:"All Specialities Retrived Successfully",
        data:result
    })
})

const deleteSpecialities = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const specialitiesId = req.params.id
    const result = await SpecialitiesServices.deleteSpecialities(specialitiesId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success:true,
        message:"Specialities Deleted Successfully",
        data:result
    })
})

export const SpecialitiesControllers={
    createSpecialities,
    getAllSpecialities,
    deleteSpecialities
}