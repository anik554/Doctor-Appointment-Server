import { prisma } from "../../shared/prisma"
import { IJWTUserPayload } from "../../types/common.types"
import { v4 as uuidv4 } from 'uuid';

const createAppointment = async(user: IJWTUserPayload, payload:{scheduleId:string, doctorId:string})=>{
    const patientData = await prisma.patient.findUniqueOrThrow({
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

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async(tnx)=>{
        const appointmentData = await tnx.appointment.create({
                data :{
                    patientId: patientData.id,
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId,
                    videoCallingId: videoCallingId
                }
            })
        await tnx.doctorSchedule.update({
            where:{
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data:{
                isBooked:isBookedOrNot.isBooked = true
             }
        
        })
        const transactionId = uuidv4();
        await tnx.payment.create({
            data:{
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId: transactionId
            }
        })
        return appointmentData;  
    })

    return result;


}   

export const AppointmentServices ={
    createAppointment
}