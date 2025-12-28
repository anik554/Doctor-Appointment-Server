import { Review } from "@prisma/client"
import ApiError from "../../errors/api.errors"
import { prisma } from "../../shared/prisma"
import { IJWTUserPayload } from "../../types/common.types"
import httpStatus from "http-status-codes"

const createReview = async (user: IJWTUserPayload, payload:Partial<Review>) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where:{
            email: user.email
        }
    })

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where:{
            id: payload.appointmentId
        }
    })

    if(patientData.id !== appointmentData.patientId){
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to review for this appointment")
    }

    return await prisma.$transaction(async (tnx)=>{
        const result = await tnx.review.create({
            data:{
                appointmentId: payload.appointmentId!,
                doctorId: appointmentData.doctorId,
                patientId: patientData.id,
                rating: payload.rating!,
                comment: payload.comment || null
            }
        })

        const avgRating = await tnx.review.aggregate({
            _avg:{
                rating: true
            },
            where:{
                doctorId: appointmentData.doctorId
            }
        })

        await tnx.doctor.update({
            where:{
                id: appointmentData.doctorId
            },
            data:{
                averageRating: avgRating._avg.rating as number || 0
            }
        })

        return result;
    })  
}

export const ReviewServices = {
  createReview
}