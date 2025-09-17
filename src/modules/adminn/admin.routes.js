import exprees from "express";
import * as adminController from "./admin.controller.js";
import { validate } from "../../utils/middleWare/validation/execution.js";
import {
  addMemeber,
  loginSchema,
  otpSchema,
  reotpSchema,
  updateMemeber,
} from "../../utils/middleWare/validation/schema.js";
import { authen } from "../../utils/middleWare/authen.js";
import { access } from "../../utils/middleWare/access.js";
import { uploadSingleFile } from "../../utils/middleWare/fileUploads.js";

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
adminRoutes.post(
  "/changepassword",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_change_password
);
adminRoutes.put(
  "/updateadmin",
  uploadSingleFile("profilePic", "image"),
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_update_profile
);
adminRoutes.put(
  "/updateMember",
  authen(["admin"]),
  validate(updateMemeber),

  adminController.handle_admin_update_member
);

//admin team
adminRoutes.post(
  "/team",
  authen(["admin"]),
  validate(addMemeber),
  adminController.adduserTeam
);

adminRoutes.get(
  "/team",
  authen(["admin"]),

  adminController.getTeam
);
adminRoutes.delete(
  "/team/:id",
  authen(["admin"]),

  adminController.deleteuserTeam
);

//USERS
adminRoutes.get(
  "/users",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_users
);
adminRoutes.get(
  "/users/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_user_by_id
);
adminRoutes.delete(
  "/users/:id",
  authen(["admin", "assistant"]),
  access("delete"),
  adminController.handle_admin_delete_user
);

//tasks
adminRoutes.get(
  "/tasks",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_tasks
);
adminRoutes.get(
  "/tasks/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_tasks_by_id
);
//tasks
adminRoutes.get(
  "/projects",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_projects
);
adminRoutes.get(
  "/projects/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_projects_by_id
);
//requests
adminRoutes.get(
  "/requets",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_requests
);
adminRoutes.get(
  "/requets/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_requests_by_id
);
adminRoutes.get(
  "/requets/most/used",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_requests_most_use
);
//tickets
adminRoutes.get(
  "/tickets",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_Tickets
);
adminRoutes.get(
  "/tickets/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_Tickets_by_id
);
adminRoutes.post(
  "/tickets/:id",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_response_Tickets_by_id
);
adminRoutes.patch(
  "/tickets/:id",
  authen(["admin", "assistant"]),
  access("update"),
  adminController.handle_admin_change_ticket_status
);
adminRoutes.patch(
  "/tickets/assign/assistant",
  authen(["admin"]),
  adminController.handle_admin_assign_ticket
);
adminRoutes.get(
  "/tags",
  authen(["admin", "assistant"]),
  access("read"),
  adminController.handle_admin_get_tags
);
adminRoutes.get(
  "/activity",
  // authen(["admin", "assistant"]),
  // access("read"),
  adminController.handle_activity
);

export default adminRoutes;
