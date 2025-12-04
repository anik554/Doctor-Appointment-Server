import z from "zod";

const createPatientValidationSchema = z.object({
  password: z.string(),
  patient: z.object({
    name: z.string().nonempty("Name is Required"),
    email: z.string().nonempty("Email is Required"),
    address: z.string().nonempty("Address is Required"),
    contactNumber: z.string().nonempty("Phone Number is Required"),
  }),
});
const createDoctorValidationSchema = z.object({
  password: z.string(),
  doctor: z.object({
    name: z.string().nonempty("Name is Required"),
    email: z.string().nonempty("Email is Required"),
    address: z.string().nonempty("Address is Required"),
    contactNumber: z.string().nonempty("Phone Number is Required"),
    registrationNumber: z.string().nonempty("Registration Number is Required"),
    experience: z.number().optional(),
    gender: z.string().optional(),
    appointmentFee: z.number(),
    qualification: z.string().nonempty("Qualification is Required"),
    currentWorkingPlace: z.string().nonempty("Current Working Place is Required"),
    designation: z.string().nonempty("Designation is Required"),
  }),
});
const createAdminValidationSchema = z.object({
  password: z.string(),
  admin: z.object({
    name: z.string().nonempty("Name is Required"),
    email: z.string().nonempty("Email is Required"),
    contactNumber: z.string().nonempty("Phone Number is Required"),
  }),
});

export const UserValidation = {
  createPatientValidationSchema,
  createDoctorValidationSchema,
  createAdminValidationSchema
};
