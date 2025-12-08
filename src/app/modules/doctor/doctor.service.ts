import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { DoctorUpdateInput } from "./doctor.interface";

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

export const DoctorServices = {
  getDoctorList,
  updateDoctorProfile,
  getDoctorById,
  deleteDoctor
};
