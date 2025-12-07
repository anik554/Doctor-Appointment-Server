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

export const DoctorControllers ={
    getDoctorList
}