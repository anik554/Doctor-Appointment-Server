import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/imageUploader";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import ApiError from "../../errors/api.errors";
import httpStatusCode from "http-status-codes";
import { IJWTUserPayload } from "../../types/common.types";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
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
        data: req.body.patient,
      });
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(httpStatusCode.CONFLICT, "Email already exists");
    }
    throw error;
  }
};

const createDoctor = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.doctor.profilePhoto = uploadResult?.secure_url;
  }
  const hashPassword = await bcrypt.hash(req.body.password, config.sald);
  try {
    const result = await prisma.$transaction(async (tnx) => {
      await tnx.user.create({
        data: {
          email: req.body.doctor.email,
          password: hashPassword,
          role: UserRole.DOCTOR,
        },
      });
      return await tnx.doctor.create({
        data: req.body.doctor,
      });
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(httpStatusCode.CONFLICT, "Email already exists");
    }
    throw error;
  }
};

const createAdmin = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.admin.profilePhoto = uploadResult?.secure_url;
  }
  const hashPassword = await bcrypt.hash(req.body.password, config.sald);
  try {
    const result = await prisma.$transaction(async (tnx) => {
      await tnx.user.create({
        data: {
          email: req.body.admin.email,
          password: hashPassword,
          role: UserRole.ADMIN,
        },
      });
      return await tnx.admin.create({
        data: req.body.admin,
      });
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(httpStatusCode.CONFLICT, "Email already exists");
    }
    throw error;
  }
};

const getAllUsers = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    where: {
      AND: whereConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: users,
  };
};

const getMyProfile = async (user: IJWTUserPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileData;
  if (userInfo.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  }
  
  return {
    ...userInfo,
    ...profileData,
  };
};

const changeProfileStatus = async (id:string, payload: {status:UserStatus})=>{
  const userData = await prisma.user.findUniqueOrThrow({
    where:{
      id
    }
  });

  const updateUserStatus = await prisma.user.update({
    where:{
      id: userData.id
    },
    data:payload
  })

  return updateUserStatus;
}

export const UserServices = {
  createPatient,
  createDoctor,
  createAdmin,
  getAllUsers,
  getMyProfile,
  changeProfileStatus
};
