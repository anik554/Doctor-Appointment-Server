import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";
import { AuthServices } from "./auth.service";

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthServices.login(req.body);
    const { accessToken, refreshToken, needPasswordChange } = result;
    res.cookie("accessToken", accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendResponse(res, {
      statusCode: httpCodes.CREATED,
      success: true,
      message: "User Loggedin Successfully!",
      data: {
        needPasswordChange,
      },
    });
  }
);

export const AuthController = {
  login,
};
