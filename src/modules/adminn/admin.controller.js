import { userModel } from "../../../database/models/user.model.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../email/sendEmail.js";

const handle_admin_signin = catchAsync(async (req, res, next) => {
  const { lang } = req.query;

  const BodyError =
    lang == "ar"
      ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      : "invaild email or password";
  const authErr = lang == "ar" ? "غير مسرح" : "Unauthorized";
  const { email, password } = req.body;

  const emailExist = await userModel.findOne({ email: email });

  if (!emailExist) return res.status(400).json({ message: BodyError });

  if (emailExist.userType != "admin")
    return res.status(401).json({ message: authErr });
  const checkPassword = bcrypt.compareSync(password, emailExist.password);

  if (checkPassword) {
    const nanoid = customAlphabet("0123456789", 4);

    const fourDigitCode = nanoid();
    emailExist.verificationCode = fourDigitCode;
    await emailExist.save();
    sendEmail(email, `Email Verification Code:${fourDigitCode}`);
    res.status(200).json({ message: "success", data: { email: email } });
  } else {
    return res.status(400).json({ message: BodyError });
  }
});

const handle_admin_verify = catchAsync(async (req, res, next) => {
  const { lang } = req.query;

  const BodyError =
    lang == "ar" ? "البريد الإلكتروني  غير صحيحة" : "invaild email ";
  const authErr = lang == "ar" ? "غير مسرح" : "Unauthorized";
  const otpErr = lang == "ar" ? "كود التحقق غير صحيح" : "invalid OTP";
  const { email, otp } = req.body;

  const emailExist = await userModel.findOne({ email: email });

  if (!emailExist) return res.status(400).json({ message: BodyError });

  if (emailExist.userType != "admin")
    return res.status(401).json({ message: authErr });

  if (emailExist.verificationCode != otp)
    return res.status(404).json({ message: otpErr });

  const token = jwt.sign(
    {
      id: emailExist._id,
      userType: emailExist.userType,
      email: emailExist.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );
  const user = await userModel.findOne({ email }).select("-password -verificationCode");
  res.status(200).json({ message: "success", data: { userData: user, token } });
});
const handle_admin_resend_otp = catchAsync(async (req, res, next) => {
  const { lang } = req.query;

  const BodyError =
    lang == "ar" ? "البريد الإلكتروني  غير صحيحة" : "invaild email ";
  const authErr = lang == "ar" ? "غير مسرح" : "Unauthorized";

  const { email } = req.body;

  const emailExist = await userModel.findOne({ email: email });

  if (!emailExist) return res.status(400).json({ message: BodyError });

  if (emailExist.userType != "admin")
    return res.status(401).json({ message: authErr });

  const nanoid = customAlphabet("0123456789", 4);

  const fourDigitCode = nanoid();
  emailExist.verificationCode = fourDigitCode;
  await emailExist.save();
  sendEmail(email, `Email Verification Code:${fourDigitCode}`);
  res.status(200).json({ message: "otp sent successfully" });
});

export { handle_admin_signin, handle_admin_verify, handle_admin_resend_otp };
