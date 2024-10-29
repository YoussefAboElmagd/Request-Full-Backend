import express from "express";
const authRouter = express.Router();

import * as authController from "./auth.controller.js";

authRouter.post("/signup", authController.signUp);
authRouter.post("/signup/google", authController.signUpWithGoogle);
authRouter.post("/signin", authController.signIn);  
authRouter.post("/forget", authController.forgetPassword);  
authRouter.post("/resend", authController.resend);  

export default authRouter;
