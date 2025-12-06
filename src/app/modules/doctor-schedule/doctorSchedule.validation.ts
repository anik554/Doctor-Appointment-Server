import z from "zod";

const createDoctorScheduleZodValidation = z.object({
    body:z.object({
        scheduleIds:z.array(z.string())
    })
})

export const DoctorScheduleZodValidations = {
    createDoctorScheduleZodValidation
}