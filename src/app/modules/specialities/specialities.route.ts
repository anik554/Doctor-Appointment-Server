import express, { NextFunction, Request, Response } from "express";
import { SpecialitiesControllers } from "./specialities.controller";
import validationRequest from "../../middlewares/validateRequest";
import { SpecialitiesZodValidations } from "./specialities.validation";
import { fileUploader } from "../../helpers/imageUploader";

const router = express.Router();

router.post(
  "/create-specialities",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialitiesZodValidations.createSpecialities.parse(
      JSON.parse(req.body.data)
    );
    return SpecialitiesControllers.createSpecialities(req, res, next);
  },
  SpecialitiesControllers.createSpecialities
);

router.get("/all-specialities", SpecialitiesControllers.getAllSpecialities);

router.delete(
  "/delete-specialities/:id",
  SpecialitiesControllers.deleteSpecialities
);

export const specialitiesRouters = router;
