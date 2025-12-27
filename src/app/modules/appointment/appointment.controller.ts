import { IJWTUserPayload } from './../../types/common.types';
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { AppointmentServices } from './appointment.service';
import sendResponse from '../../shared/sendResponse';
import httpCodes from "http-status-codes";
import pick from '../../helpers/pick';
import { userFilterableFields, userFilterableOptions } from '../user/user.constant';

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

const getMyAppointments = catchAsync(async(req:Request &{user?: IJWTUserPayload}, res:Response, next: NextFunction)=>{
    const options = pick(req.query, ['page', 'limit', 'skip', 'sortBy', 'sortOrder']);
    const fillters = pick(req.query, ['status', 'paymentStatus']);
    const user = req.user
    const result = await AppointmentServices.getMyAppointments(user as IJWTUserPayload, options, fillters)

    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"Appointments Retrieved Successfully",
        data:result
    })
})

const getAllAppointments = catchAsync(async(req:Request &{user?: IJWTUserPayload}, res:Response, next: NextFunction)=>{
    const user = req.user
    const filter = pick(req.query,userFilterableFields) // searching, filtering
    const options = pick(req.query,userFilterableOptions) // pagination and sorting
    const result = await AppointmentServices.getAllAppointments(user as IJWTUserPayload, options, filter)

    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"All Appointments Retrieved Successfully",
        data:result
    })
})

const updateAppointmentStatus = catchAsync(async(req:Request &{user?: IJWTUserPayload}, res:Response, next: NextFunction)=>{
    const {id}=req.params;
    const {status}=req.body;
    const user = req.user;
    const result = await AppointmentServices.updateAppointmentStatus(id,status,user as IJWTUserPayload)
    sendResponse(res,{
        statusCode : httpCodes.OK,
        success: true,
        message:"Appointments Status Update Successfully",
        data:result
    })
})

export const AppointmentControllers ={
    createAppointment,
    getMyAppointments,
    updateAppointmentStatus,
    getAllAppointments
}