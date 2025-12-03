import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

type ExpiresIn = string | number;

const generateToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: ExpiresIn
) => {
  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelper = {
  generateToken,
  verifyToken,
};
