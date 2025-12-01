import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    throw new Error("Password is incorrect!");
  }
  const userData = {
    email: payload.password,
    role: user.role,
  };
  const accessToken = await jwt.sign(userData, "abc", {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  return {
    accessToken,
  };
};

export const AuthServices = {
  login,
};
