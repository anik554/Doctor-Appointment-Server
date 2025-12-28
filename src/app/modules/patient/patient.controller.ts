import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import pick from "../../helpers/pick";
import { patientFilterableFields } from "./patient.constant";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status-codes";
import { PatientServices } from "./patient.service";
import { IJWTUserPayload } from "../../types/common.types";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, patientFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await PatientServices.getAllPatients(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patients retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
})

const getPatientById = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const result = await PatientServices.getPatientById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient retrieval successfully',
        data: result,
    });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientServices.softDelete(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient soft deleted successfully',
        data: result,
    });
});

const updatePatient = catchAsync(async (req: Request & { user?: IJWTUserPayload }, res: Response) => {
    const user = req.user;
    const result = await PatientServices.updatePatient(user!, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient updated successfully',
        data: result,
    });
});

export const PatientControllers = {
    getAllPatients,
    getPatientById,
    softDelete,
    updatePatient
};