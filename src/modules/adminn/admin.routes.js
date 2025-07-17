import exprees from "express";
import * as adminController from "./admin.controller.js";
import { validate } from "../../utils/middleWare/validation/execution.js";
import {
  loginSchema,
  otpSchema,
  reotpSchema,
} from "../../utils/middleWare/validation/schema.js";
import { authen } from "../../utils/middleWare/authen.js";

const adminRoutes = exprees.Router();
// AUTH
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

//USERS
adminRoutes.get(
  "/users",
  authen(["admin"]),
  adminController.handle_admin_get_users
);
adminRoutes.get(
  "/users/:id",
  authen(["admin"]),
  adminController.handle_admin_get_user_by_id
);
adminRoutes.delete(
  "/users/:id",
  authen(["admin"]),
  adminController.handle_admin_delete_user
);

//tasks
adminRoutes.get(
  "/tasks",
  authen(["admin"]),
  adminController.handle_admin_get_tasks
);
adminRoutes.get(
  "/tasks/:id",
  authen(["admin"]),
  adminController.handle_admin_get_tasks_by_id
);
//tasks
adminRoutes.get(
  "/projects",
  authen(["admin"]),
  adminController.handle_admin_get_projects
);
adminRoutes.get(
  "/projects/:id",
  authen(["admin"]),
  adminController.handle_admin_get_projects_by_id
);
//requests
adminRoutes.get(
  "/requets",
  authen(["admin"]),
  adminController.handle_admin_get_requests
);
adminRoutes.get(
  "/requets/:id",
  authen(["admin"]),
  adminController.handle_admin_get_requests_by_id
);
adminRoutes.get(
  "/requets/most/used",
  authen(["admin"]),
  adminController.handle_admin_get_requests_most_use
);
//tickets
adminRoutes.get(
  "/tickets",
  authen(["admin"]),
  adminController.handle_admin_get_Tickets
);
adminRoutes.get(
  "/tickets/:id",
  authen(["admin"]),
  adminController.handle_admin_get_Tickets_by_id
);
adminRoutes.post(
  "/tickets/:id",
  authen(["admin"]),
  adminController.handle_admin_response_Tickets_by_id
);
adminRoutes.patch(
  "/tickets/:id",
  authen(["admin"]),
  adminController.handle_admin_change_ticket_status
);

export default adminRoutes;
