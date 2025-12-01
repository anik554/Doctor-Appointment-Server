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

export const UserValidation = {
  createPatientValidationSchema,
};
