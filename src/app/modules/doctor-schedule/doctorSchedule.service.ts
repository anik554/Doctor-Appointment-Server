import ApiError from "../../errors/api.errors";
import { prisma } from "../../shared/prisma"
import { IJWTUserPayload } from "../../types/common.types"
import httpCodes from "http-status-codes";

const createDoctorSchedule = async(user:IJWTUserPayload,payload:{scheduleIds:string[]})=>{
    console.log(user)
    const doctor = await prisma.doctor.findUnique({
    where: { email: user.email },
  });
   if (!doctor) {
    throw new ApiError(httpCodes.NOT_FOUND,"Doctor not found for this user");
  }
    const doctorScheduleData = payload.scheduleIds.map(scheduleId =>({
        doctorId:doctor.id,
        scheduleId
    }))
    const result = await prisma.doctorSchedule.createMany({
        data: doctorScheduleData
    })
    return result
}

export const DoctorScheduleServices={
    createDoctorSchedule
}