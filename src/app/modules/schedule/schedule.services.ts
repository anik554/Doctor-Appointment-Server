import config from "../../../config";
import { addMinutes,addHours,format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { paginationHelper } from "../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";


const createSchedule = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = config.interval_time;
  const schedules = []

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while(startDateTime < endDateTime){
        const slotStartDateTime = startDateTime; //10:00
        const slotEndDateTime = addMinutes(startDateTime,intervalTime); //10:30
        const scheduleData ={
            startDateTime: slotStartDateTime,
            endDateTime: slotEndDateTime
        }
        const existingSchedule = await prisma.schedule.findFirst({
          where:scheduleData
        })
        if(!existingSchedule){
          const result = await prisma.schedule.create({
            data:scheduleData
          })
          schedules.push(result)
        }
        slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime)  
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

const getScheduleForDoctor = async(options:any,filters:any)=>{
  const {page,limit,skip,sortBy,sortOrder}=paginationHelper.calculatePagination(options);
  const {startDateTime: filterStartDateTime,endDateTime: filterEndDateTime}=filters;

  const andConditions: Prisma.ScheduleWhereInput[]=[]

  if(filterStartDateTime && filterEndDateTime){
    andConditions.push({
      AND: [
        {
          startDateTime:{
            gte:filterStartDateTime
          }
        },
        {
          endDateTime:{
            lte: filterEndDateTime
          }
        }
      ]
    })
  }
  const whereConditions : Prisma.ScheduleWhereInput = andConditions.length > 0 ?{
    AND: andConditions
  }:{}

  const result = await prisma.schedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:{
      [sortBy]:sortOrder
    }
  });

  const total = await prisma.schedule.count({
    where: whereConditions
  })

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
}

const deleteSchedule = async(id:string)=>{
  const isExistingSchedule = await prisma.schedule.findUnique({
    where:{
      id
    }
  })
  if(!isExistingSchedule){
    throw new Error("Schedule Already Deleted!!")
  }
  const result = await prisma.schedule.delete({
    where:{
      id
    }
  })
  return result
}

export const ScheduleServices = {
  createSchedule,
  getScheduleForDoctor,
  deleteSchedule
};
