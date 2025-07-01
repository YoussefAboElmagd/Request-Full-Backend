import exprees from "express";
import * as adminController from "./admin.controller.js";
import { validate } from "../../utils/middleWare/validation/execution.js";
import {
  loginSchema,
  otpSchema,
  reotpSchema,
} from "../../utils/middleWare/validation/schema.js";

const adminRoutes = exprees.Router();

adminRoutes.post(
  "/signin",
  validate(loginSchema),
  adminController.handle_admin_signin
);
adminRoutes.post(
  "/verify",
  validate(otpSchema),
  adminController.handle_admin_verify
);
adminRoutes.post(
  "/resendotp",
  validate(reotpSchema),
  adminController.handle_admin_resend_otp
);

export default adminRoutes;
