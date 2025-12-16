import { prisma } from "../../shared/prisma"
import { IJWTUserPayload } from "../../types/common.types"

const createAppointment = async(user: IJWTUserPayload, payload:{scheduleId:string, doctorId:string})=>{
    const patientData = await prisma.user.findUniqueOrThrow({
        where:{
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where:{
            id: payload.doctorId,
            isdeleted:false
        }
    })

    const isBookedOrNot = await prisma.doctorSchedule.findFirstOrThrow({
        where:{
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked:false
        }
    })
}   

export const AppointmentServices ={
    createAppointment
}