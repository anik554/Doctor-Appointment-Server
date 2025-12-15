import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helpers/pick";
import { DoctorServices } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status-codes";
import { doctorFilterableFields } from "./doctor.constant";

const getDoctorList = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const options = pick(req.query, ["page","limit","sortBy", "sortOrder"]);
    const filters = pick(req.query, doctorFilterableFields)

    const result = await DoctorServices.getDoctorList(options,filters);

    sendResponse(res,{
        statusCode:httpStatus.OK,
        success:true,
        message:"Doctor List Retrived Successfully",
        meta:result.meta,
        data:result.data
    })
})

const updateDoctorProfile = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const doctorId = req.params.id
    const result = await DoctorServices.updateDoctorProfile(doctorId,req.body);

    sendResponse(res,{
        statusCode:httpStatus.OK,
        success:true,
        message:"Doctor Profile Updated Successfully",
        data:result
    })
})

const getDoctorById = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const doctorId = req.params.id
    const result = await DoctorServices.getDoctorById(doctorId);

    sendResponse(res,{
        statusCode:httpStatus.OK,
        success:true,
        message:"Doctor Retrived Successfully",
        data:result
    })
})

const deleteDoctor = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const doctorId = req.params.id
    const result = await DoctorServices.deleteDoctor(doctorId);

    sendResponse(res,{
        statusCode:httpStatus.OK,
        success:true,
        message:"Doctor Deleted Successfully",
        data:result
    })
})

const getAISuggestions = catchAsync(async(req:Request,res:Response)=>{
    const result = await DoctorServices.getAISuggestions(req.body);

    sendResponse(res,{
        statusCode:httpStatus.OK,
        success:true,
        message:"AI suggestions fetched Successfully",
        data:result
    })
})

export const DoctorControllers ={
    getDoctorList,
    updateDoctorProfile,
    getDoctorById,
    deleteDoctor,
    getAISuggestions
}