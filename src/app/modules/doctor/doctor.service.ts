import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { DoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/api.errors";
import httpStatus from "http-status-codes"
import { openai } from "../../helpers/openRouter";
import { extractJsonFromMessage } from "../../helpers/extractJsonFromMessage";

const getDoctorList = async (options: IOptions, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, specialities, ...filterData } = filters;

  const andConditons: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditons.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if(specialities && specialities.length >0){
    andConditons.push({
        doctorSpecialities:{
            some:{
                specialities:{
                    title:{
                        contains:specialities,
                        mode:"insensitive"
                    }
                }
            }
        }
    })
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andConditons.push(...filterConditions);
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditons.length > 0 ? { AND: andConditons } : {};
  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:{
        doctorSpecialities:{
            include:{
                specialities:true
            }
        }
    }
  });
  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateDoctorProfile = async (
  id: string,
  payload: Partial<DoctorUpdateInput>
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const { specialities, ...doctorData } = payload;
  return await prisma.$transaction(async (tnx) => {
    if (specialities && specialities.length > 0) {
      const deleteSpecialitiesIds = specialities.filter(
        (speciality) => speciality.isDeleted
      );
      for (const speciality of deleteSpecialitiesIds) {
        await tnx.doctorSpecialities.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: speciality.specialityId,
          },
        });
      }
      const createSpecialitiesIds = specialities.filter(
        (speciality) => !speciality.isDeleted
      );
      for (const speciality of createSpecialitiesIds) {
        await tnx.doctorSpecialities.create({
          data: {
            doctorId: id,
            specialitiesId: speciality.specialityId,
          },
        });
      }
    }
    const updatedData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialities: {
          include: {
            specialities: true,
          },
        },
      },
    });
    return updatedData;
  });
};

const getDoctorById = async(id:string)=>{
    const isDoctorExists = await prisma.doctor.findUniqueOrThrow({
        where:{
            id
        }
    })
    return isDoctorExists;
}

const deleteDoctor = async(id:string)=>{
    const isDoctorExists = await prisma.doctor.findUniqueOrThrow({
        where:{
            id
        }
    })
    const result = await prisma.doctor.delete({
        where:{
            id: isDoctorExists.id
        }
    })
    return result;
}

const getAISuggestions = async (payload: { symtomps: string }) => {
  console.log("symptoms",payload.symtomps)
  if (!payload?.symtomps?.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "symtomps is required");
  }

  const doctors = await prisma.doctor.findMany({
    where: { isdeleted: false },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });

  if (!doctors.length) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No doctors available for recommendation"
    );
  }

const systemPrompt = "You are a helpful AI medical assistant that provides doctor suggestions.";

const simplifiedDoctors = doctors.map(d => ({
  id: d.id,
  name: d.name,
  experience: d.experience,
  specialities: d.doctorSpecialities.map(
    ds => ds.specialities.title
  ),
}));

 const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symtomps}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;

  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: prompt.trim() },
    ]
  });

  const result = extractJsonFromMessage(completion.choices[0]?.message);
  return result
  
};


export const DoctorServices = {
  getDoctorList,
  updateDoctorProfile,
  getDoctorById,
  deleteDoctor,
  getAISuggestions
};
