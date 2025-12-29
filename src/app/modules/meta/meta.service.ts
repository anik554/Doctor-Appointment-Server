import { PaymentStatus, UserRole } from "@prisma/client";
import { IJWTUserPayload } from "../../types/common.types";
import ApiError from "../../errors/api.errors";
import httpStatus from "http-status-codes";
import { prisma } from "../../shared/prisma";

const fetchDashboardMetadata = async (user: IJWTUserPayload) => {
  let metadata;

  switch (user.role) {
    case UserRole.PATIENT:
      metadata = "Patient Metadata";
      break;
    case UserRole.DOCTOR:
      metadata = "Doctor Metadata";
      break;
    case UserRole.ADMIN:
      metadata = await getAdminMetaData();
      break;
    default:
      throw new ApiError(httpStatus.BAD_GATEWAY, "Invalid user role!");
  }

  return metadata;
};

const getAdminMetaData = async()=>{
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const adminCount = await prisma.admin.count();
    const appointmentCount = await prisma.appointment.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum:{
            amount: true
        },
        where:{
            status: PaymentStatus.PAID
        }
    });

    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        patientCount,
        doctorCount,
        adminCount,
        appointmentCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieChartData
    }
};

const getBarChartData = async ()=>{
    const appointmentCountPerMonth = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `
    return appointmentCountPerMonth;
};

const getPieChartData = async ()=>{
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count:{id:true}
    });

    const formatedAppointmentStatusDistribution = appointmentStatusDistribution.map(({status, _count})=>({
        status,
        count: Number(_count.id)
    }));

    return formatedAppointmentStatusDistribution;
}

export const MetaServices = {
  fetchDashboardMetadata,
  getAdminMetaData,
};
