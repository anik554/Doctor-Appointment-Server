import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/imageUploader";

const createPatient = async (req:Request) => {
  if(req.file){
    const uploadResult = await fileUploader.uploadToCloudinary(req.file)
    req.body.patient.profilePhoto = uploadResult?.secure_url
  }
  const hashPassword = await bcrypt.hash(req.body.password, config.sald);
  try {
    const result = await prisma.$transaction(async (tnx) => {
      await tnx.user.create({
        data: {
          email: req.body.patient.email,
          password: hashPassword,
        },
      });
      return await tnx.patient.create({
        data:req.body.patient,
      });
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Email already exists");
    }
    throw error;
  }
};

export const UserServices = {
  createPatient,
};
