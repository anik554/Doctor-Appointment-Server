import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTUserPayload } from "../../types/common.types";
import { prescriptionServices } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";
import pick from "../../helpers/pick";

const createPrescription = catchAsync(
  async (req: Request & { user?: IJWTUserPayload }, res: Response) => {
    const user = req.user;
    const result = await prescriptionServices.createPrescription(
      user as IJWTUserPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpCodes.CREATED,
      success: true,
      message: "Prescription Created Successfully!",
      data: result,
    });
  }
);

const getMyPrescriptions = catchAsync(
  async (req: Request & { user?: IJWTUserPayload }, res: Response) => {
    const user = req.user;
    const options = pick(req.query, [
      "page",
      "limit",
      "skip",
      "sortBy",
      "sortOrder",
    ]);
    const fillters = pick(req.query, ["status", "paymentStatus"]);
    const result = await prescriptionServices.getMyPrescriptions(
      user as IJWTUserPayload,
      options,
      fillters
    );

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "My Prescriptions Retrived Successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const prescriptionControllers = {
  createPrescription,
  getMyPrescriptions,
};
