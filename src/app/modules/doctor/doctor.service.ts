import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { DoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/api.errors";
import httpStatus from "http-status-codes"
import { openai } from "../../helpers/openRouter";

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
  if (!payload?.symtomps) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Symptom is required");
  }

  // 1️⃣ Load doctors
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

  // 2️⃣ User prompt
  const userPrompt = `
Patient Symptoms:
${payload.symtomps}

Available Doctors:
${JSON.stringify(doctors, null, 2)}

Instructions:
1. Analyze the patient's symptoms carefully
2. Match symptoms with the most appropriate medical specialities
3. Recommend up to 3 doctors from the provided list
4. Rank doctors by relevance (highest first)
5. Give a short reason for each recommendation

Response Format (JSON only):
{
  "recommendations": [
    {
      "doctorId": "string",
      "doctorName": "string",
      "specialities": ["string"],
      "experience": number,
      "designation": "string",
      "currentWorkingPlace": "string",
      "appointmentFee": number,
      "relevanceScore": number,
      "reason": "string"
    }
  ],
  "symptomAnalysis": "string",
  "urgencyLevel": "low | medium | high",
  "disclaimer": "string"
}

Important:
- Return ONLY valid JSON
- Do NOT include explanations or markdown
- Use ONLY the provided doctor data
`;

  // 3️⃣ System prompt
  const systemPrompt = `
You are a medical triage assistant.
- Analyze patient symptoms
- Match symptoms with medical specialities
- Recommend suitable doctors from the provided list
- Never give medical diagnosis
- Always return valid JSON only
`;

  // 4️⃣ OpenRouter call
  const completion = await openai.chat.completions.create({
    model: "tngtech/deepseek-r1t2-chimera:free",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  });

  // 5️⃣ Parse AI response
  const aiMessage = completion.choices[0]?.message?.content;

  if (!aiMessage) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Empty AI response"
    );
  }

  let aiData;
  try {
    aiData = JSON.parse(aiMessage);
  } catch {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Invalid JSON returned by AI"
    );
  }

  // 6️⃣ Basic validation
  if (!Array.isArray(aiData?.recommendations)) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "AI response structure invalid"
    );
  }

  return aiData;
};

export const DoctorServices = {
  getDoctorList,
  updateDoctorProfile,
  getDoctorById,
  deleteDoctor,
  getAISuggestions
};
