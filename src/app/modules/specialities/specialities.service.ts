import { Request } from "express";
import { fileUploader } from "../../helpers/imageUploader";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/api.errors";
import httpStatus from 'http-status-codes';


const createSpecialities = async(req: Request)=>{
    const file = req.file;
    if(file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.icon = uploadToCloudinary?.secure_url;
    }
     if(!req.body.title){
        throw new ApiError(400, "Title is required");
    }
    if(!req.body.icon){
        throw new ApiError(400, "Icon (file upload) failed");
    }
    const result = await prisma.specialities.create({
        data: req.body
    })
    console.log(result)
    return result;
}

const getAllSpecialities =async()=>{
    return await prisma.specialities.findMany()
}

const deleteSpecialities =async(id:string)=>{
    const isExistingSpecialities = await prisma.specialities.findUniqueOrThrow({
        where : {
            id
        }
    })
    if(isExistingSpecialities){
        throw new ApiError(httpStatus.CONFLICT,"Specialities Already Existing")
    }
    const result = await prisma.specialities.delete({
        where:{
            id
        }
    })
    return result
}

export const SpecialitiesServices ={
    createSpecialities,
    getAllSpecialities,
    deleteSpecialities
}