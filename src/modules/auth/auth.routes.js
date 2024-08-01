import express from "express";
const authRouter = express.Router();

import * as authController from "./auth.controller.js";

authRouter.post("/signup", authController.signUp);
authRouter.post("/signin", authController.signIn);

export default authRouter;
