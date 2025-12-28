import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTUserPayload } from "../../types/common.types";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status-codes";
import { ReviewServices } from "./review.service";

const createReview = catchAsync(async (req:Request & {user?: IJWTUserPayload}, res: Response)=>{
    const user = req.user;
    const result = await ReviewServices.createReview(user!, req.body);

   sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review Created Successfully!",
      data: result,
    });
})

export const ReviewControllers = {
  createReview
};