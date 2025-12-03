import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/imageUploader";
import { UserValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
const router = express.Router();

router.post(
  "/create-patient",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createPatientValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createPatient(req, res, next);
  }
);

router.post(
  "/create-doctor",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createDoctor(req, res, next);
  }
);

router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createAdmin(req, res, next);
  }
);

router.get("/all-users", auth(UserRole.ADMIN), UserController.getAllUsers);

export const userRoutes = router;
