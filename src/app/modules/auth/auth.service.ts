import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { jwtHelper } from "../../helpers/jwtHelper";
import config from "../../../config";
import ApiError from "../../errors/api.errors";
import httpStatusCode from "http-status-codes"

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatusCode.BAD_REQUEST,"Password is incorrect!");
  }
  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwtHelper.generateToken(
    userData,
    config.access_token_secret!,
    config.access_token_expiresin!
  );
  const refreshToken = jwtHelper.generateToken(
    userData,
    config.refresh_token_secret!,
    config.refresh_token_expiresin!
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange
  };
};

export const AuthServices = {
  login,
};
