import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  Prisma,
  UserRole,
} from "@prisma/client";
import { IJWTUserPayload } from "../../types/common.types";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.errors";
import httpStatus from "http-status-codes";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";

const createPrescription = async (
  user: IJWTUserPayload,
  payload: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (user.email !== appointmentData.doctor.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This is not your appontment");
    }
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const getMyPrescriptions = async (
  user: IJWTUserPayload,
  options: IOptions,
  fillters: any
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { ...filterData } = fillters;
  const userData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const addConditions: Prisma.PrescriptionWhereInput[] = [];

  if (user.role === UserRole.PATIENT) {
    addConditions.push({
      patient: {
        email: userData.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => {
      return {
        [key]: {
          equals: filterData[key],
        },
      };
    });
    addConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.PrescriptionWhereInput =
    addConditions.length > 0 ? { AND: addConditions } : {};

  const result = await prisma.prescription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
    },
  });

  const total = await prisma.prescription.count({
    where: whereConditions
  })

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

export const prescriptionServices = {
  createPrescription,
  getMyPrescriptions,
};
