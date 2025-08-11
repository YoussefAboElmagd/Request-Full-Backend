import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
export const otpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  otp: Joi.string().min(4).max(4),
});
export const reotpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
});
export const addMemeber = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),

  vocation: Joi.string().required().messages({
    "string.empty": "Vocation is required",
  }),
  phone:Joi.string().required(),

  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),

  

  access: Joi.array()
    .items(Joi.string().valid("read", "update", "create"))
    .min(1)
    .required()
    .messages({
      "array.base": "Access must be an array",
      "array.min": "At least one access permission is required",
      "any.required": "Access is required",
      "any.only": "Access can only include 'read', 'update', or 'create'",
    }),
});
