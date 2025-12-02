import { NextFunction, Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const generateToken =
  (payload: string | object, secret: Secret, expiresIn: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = jwt.sign(payload, secret, {
      algorithm: "HS256",
      expiresIn,
    } as SignOptions);
    return token;
  };

export const jwtHelper = {
  generateToken,
};
