import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { patientSearchableFields } from "./patient.constant";
import { IPatientFilterRequest } from "./patient.interface";
import { prisma } from "../../shared/prisma";
import { Prisma, Patient, UserStatus } from "@prisma/client";
import { IJWTUserPayload } from "../../types/common.types";

const getAllPatients = async (
  filters: IPatientFilterRequest,
  options: IOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.PatientWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    isdeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.patient.count({
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

const getPatientById = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

const softDelete = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        isdeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
};

const updatePatient = async (user : IJWTUserPayload, payload: any)=>{
    const {medicalReport, patientHealthData, ...patientdata} = payload

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where:{
            email: user.email,
            isdeleted: false
        }
    })

    return await prisma.$transaction(async(tnx)=>{
        await tnx.patient.update({
            where:{
                id: patientInfo.id
            },
            data: patientdata
        })

        if(patientHealthData){
            await tnx.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id
                },
                update: patientHealthData,
                create: {
                    patientId: patientInfo.id,
                    ...patientHealthData
                }
            })
        }

        if(medicalReport){
            await tnx.medicalRecord.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id,
                }
            })
        }

        const result = await tnx.patient.findUnique({
            where: {
                id: patientInfo.id
            },
            include:{
                patientHealthData: true,
                medicalRecords: true
            }
        })
        return result
    })
}

export const PatientServices = {
  getAllPatients,
  getPatientById,
  softDelete,
  updatePatient
};
