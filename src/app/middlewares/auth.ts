import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helpers/jwtHelper"
import config from "../../config"
import ApiError from "../errors/api.errors"
import httpCodes from "http-status-codes";

const auth = (...roles:string[])=>{
    return async(req:Request & {user?:any},res:Response,next:NextFunction)=>{
        try{
            const token = req.cookies.accessToken
            if(!token){
                throw new ApiError(httpCodes.UNAUTHORIZED,"You are not authorized")
            }
            const verifyUser = jwtHelper.verifyToken(token,config.access_token_secret as string)
            req.user = verifyUser
            if(roles.length && !roles.includes(verifyUser.role)){
                throw new ApiError(httpCodes.UNAUTHORIZED,"You are not authorized")
            }
            next()
        }
        catch(err){
            next(err)
        }
    }
}

export default auth;