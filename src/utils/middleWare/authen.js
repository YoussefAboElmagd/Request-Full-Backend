import jwt from "jsonwebtoken";
import { userModel } from "../../../database/models/user.model.js";

export const authen = (role = ["user"]) => {
  return (req, res, next) => {
    const token = req.headers.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decode) => {
        if (err) return next(new AppError("Token is not valid", 401));
        const admin = await userModel
          .findById(decode.userId)
          .select("userType");
        console.log(admin.userType);
        if (role.includes(admin.userType)) {
          req.user = decode.user;
          return next();
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      });
    } else {
      return res.status(401).json({ message: "token is required" });
    }
  };
};
