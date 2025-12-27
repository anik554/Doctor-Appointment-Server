import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { stripe } from "../../helpers/stripe";
import { prisma } from "../../shared/prisma";
import { IJWTUserPayload } from "../../types/common.types";
import { v4 as uuidv4 } from "uuid";
import { userSearchableFields } from "../user/user.constant";
import ApiError from "../../errors/api.errors";
import httpStatus from "http-status-codes";

const createAppointment = async (
  user: IJWTUserPayload,
  payload: { scheduleId: string; doctorId: string }
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isdeleted: false,
    },
  });

  await prisma.doctorSchedule.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId: videoCallingId,
      },
    });
    await tnx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    const transactionId = uuidv4();
    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId: transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: "Doctor Appointment Fee",
              description: `Appointment with: ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: String(appointmentData.id),
        paymentId: String(paymentData.id),
      },
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });
    return { payment_url: session.url };
  });

  return result;
};

const getAllAppointments = async (user:IJWTUserPayload, options:IOptions, params: any)=>{
  const {page, limit, skip, sortBy, sortOrder} = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if(user.role !== UserRole.ADMIN){
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not authorized")
  }

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

  const whereConditions: Prisma.AppointmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include:{
      patient: true,
      doctor:true
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
}

const getMyAppointments = async (user:IJWTUserPayload, options:IOptions, fillters:any)=>{
  const {page, limit, skip, sortBy, sortOrder} = paginationHelper.calculatePagination(options);
  const {...filterData} = fillters;

  const addConditions: Prisma.AppointmentWhereInput[] = [];

  if(user.role === UserRole.PATIENT){
    addConditions.push({
      patient: {
        email: user.email
      }
    })
  } else if(user.role === UserRole.DOCTOR){
    addConditions.push({
      doctor: {
        email: user.email
      }
    })
  } 
  
  if(Object.keys(filterData).length > 0){
    const filterConditions = Object.keys(filterData).map((key)=>{
      return {
        [key]: {
          equals: filterData[key]
        }
      }
    })
    addConditions.push(...filterConditions)
  }

  const whereConditions: Prisma.AppointmentWhereInput = addConditions.length > 0 ? { AND: addConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    },
    include:user.role === UserRole.PATIENT ? {
      doctor: true,
      schedule: true,
    } : user.role === UserRole.DOCTOR ? {
      patient: true,
      schedule: true,
    } : undefined
  });

  const total = await prisma.appointment.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
}

const updateAppointmentStatus = async(appointmentId:string, status:AppointmentStatus, user: IJWTUserPayload)=>{
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where:{
      id: appointmentId
    },
    include:{
      doctor:true
    }
  })

  if(user.role === UserRole.DOCTOR){
    if(appointmentData.doctor.email !== user.email){
      throw new Error("This is not your appointment")
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId
    },
    data:{
      status
    }
  })

  return result;
};

export const AppointmentServices = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAllAppointments
};
