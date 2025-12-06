import z from "zod";

const createSpecialities = z.object({
  
    title: z.string({
      error: "Title is Required",
    }),
  
});

export const SpecialitiesZodValidations = {
  createSpecialities,
};
