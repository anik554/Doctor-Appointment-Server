import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { createPatientInput } from "./user.interfaces";
import bcrypt from "bcryptjs";

const createPatient = async (payload: createPatientInput) => {
  if (!payload.password || !payload.email || !payload.name || !payload.contactNumber) {
    throw new Error("Missing required patient fields");
  }

  const hashPassword = await bcrypt.hash(payload.password, config.sald);

  try {
    const result = await prisma.$transaction(async (tnx) => {
      const createdUser = await tnx.user.create({
        data: {
          email: payload.email,
          password: hashPassword,
        },
      });

      const createdPatient = await tnx.patient.create({
        data: {
          name: payload.name,
          email: payload.email,
          contactNumber: payload.contactNumber,
          address: payload.address,
        },
      });

      return { user: createdUser, patient: createdPatient };
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
