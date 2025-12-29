import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTUserPayload } from "../../types/common.types";
import { MetaServices } from "./meta.service";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";

const fetchDashboardMetadata = catchAsync(
  async (req: Request & { user?: IJWTUserPayload }, res: Response) => {
    const user = req.user;
    const result = await MetaServices.fetchDashboardMetadata(
      user as IJWTUserPayload
    );

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "Meta Data Retrived Successfully!",
      data: result,
    });
  }
);

const getAdminMetaData = catchAsync(async(req: Request, res: Response)=>{
    const result = await MetaServices.getAdminMetaData()

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "Meta Data Retrived Successfully",
      data: result,
    });
})

export const MetaControllers = {
  fetchDashboardMetadata,
  getAdminMetaData
};
