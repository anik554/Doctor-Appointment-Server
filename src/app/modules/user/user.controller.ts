import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserServices } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";
import { UserRole, UserStatus } from "@prisma/client";
import pick from "../../helpers/pick";
import { userFilterableFields, userFilterableOptions } from "./user.constant";

const createPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const patient = await UserServices.createPatient(req);
    sendResponse(res, {
      statusCode: httpCodes.CREATED,
      success: true,
      message: "Patient Created Successfully!",
      data: patient,
    });
  }
);

const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await UserServices.createDoctor(req);
    sendResponse(res, {
      statusCode: httpCodes.CREATED,
      success: true,
      message: "Doctor Created Successfully!",
      data: doctor,
    });
  }
);

const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const admin = await UserServices.createAdmin(req);
    sendResponse(res, {
      statusCode: httpCodes.CREATED,
      success: true,
      message: "Admin Created Successfully!",
      data: admin,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {

  const filter = pick(req.query,userFilterableFields) // searching, filtering
  const options = pick(req.query,userFilterableOptions) // pagination and sorting

  const users = await UserServices.getAllUsers(filter,options);
  sendResponse(res, {
    statusCode: httpCodes.OK,
    success: true,
    message: "Users Retrived Successfully!",
    meta: users.meta,
    data: users.data,
  });
});

export const UserController = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllUsers,
};
