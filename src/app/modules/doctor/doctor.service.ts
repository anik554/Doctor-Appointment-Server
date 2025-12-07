import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper"
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";

const getDoctorList =async(options:IOptions,filters:any)=>{
    const {page,limit,skip,sortBy,sortOrder}= paginationHelper.calculatePagination(options)
    const {searchTerm,specialities,...filterData}= filters;

    const andConditons: Prisma.DoctorWhereInput[] =[]

    if(searchTerm){
       andConditons.push({
         OR:doctorSearchableFields.map((field)=>({
            [field]:{
                contains: searchTerm,
                mode:"insensitive"
            }
        }))
       })
    }

    if(Object.keys(filterData).length > 0){
        const filterConditions = Object.keys(filterData).map((key)=>({
            [key]:{
                equals: (filterData)[key]
            }
        }))
        andConditons.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput =andConditons.length > 0 ? {AND: andConditons} :{}
    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:{
            [sortBy]: sortOrder
        }
    })
    const total = await prisma.doctor.count({
        where : whereConditions
    })

    return {
        meta:{
            total,
            page,
            limit
        },
        data: result
    }
}

export const DoctorServices = {
    getDoctorList
}