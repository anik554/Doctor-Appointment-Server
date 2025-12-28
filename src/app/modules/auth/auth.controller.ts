import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpCodes from "http-status-codes";
import { AuthServices } from "./auth.service";
import { IJWTUserPayload } from "../../types/common.types";

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

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    const result = await AuthServices.refreshToken(refreshToken);
    res.cookie("accessToken", result.accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60,
    });

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "Access Token Generated Successfully!",
      data: {
        result,
      },
    });
  }
);

const changePassword = catchAsync(
  async (req: Request & { user?: IJWTUserPayload }, res: Response) => {
    const user = req.user;
    const result = await AuthServices.changePassword(
      user as IJWTUserPayload,
      req.body
    );

    sendResponse(res, {
      statusCode: httpCodes.OK,
      success: true,
      message: "Password Changed Successfully!",
      data: result,
    });
  }
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpCodes.OK,
    success: true,
    message: "Check your email!",
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthServices.getMe(userSession);

  sendResponse(res, {
    statusCode: httpCodes.OK,
    success: true,
    message: "User Retrived Successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpCodes.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

export const AuthController = {
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  getMe,
  resetPassword
};
