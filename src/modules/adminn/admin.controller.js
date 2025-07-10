import { userModel } from "../../../database/models/user.model.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../email/sendEmail.js";
import { userTypeModel } from "../../../database/models/userType.model.js";
import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { taskModel } from "../../../database/models/tasks.model.js";

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
  const user = await userModel
    .findOne({ email })
    .select("-password -verificationCode");
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
const handle_admin_get_users = catchAsync(async (req, res, next) => {
  // Use aggregation instead of find
  const users = await userModel.aggregate([
    {
      $match: {
        userType: { $ne: "admin" },
      },
    },
    {
      $lookup: {
        from: "usertypes", // replace with actual collection name of userTypeModel if different
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: "$role",
    },
    {
      $project: {
        profilePic: 1,
        name: 1,
        email: 1,
        role: {
          jobTitle: "$role.jobTitle",
        },
      },
    },
  ]);

  // Fetch role IDs using direct queries
  const [owner, contractor, consultant] = await Promise.all([
    userTypeModel.findOne({ jobTitle: "owner" }).select("_id"),
    userTypeModel.findOne({ jobTitle: "contractor" }).select("_id"),
    userTypeModel.findOne({ jobTitle: "consultant" }).select("_id"),
  ]);

  if (!owner || !contractor || !consultant) {
    return res
      .status(500)
      .json({ message: "Some roles are missing in the database." });
  }

  // Count documents by role
  const [countOwner, countContractor, countConsultant] = await Promise.all([
    userModel.countDocuments({ role: owner._id }),
    userModel.countDocuments({ role: contractor._id }),
    userModel.countDocuments({ role: consultant._id }),
  ]);

  res.status(200).json({
    message: "users found successfully",
    users,
    stats: {
      owner: countOwner,
      contractor: countContractor,
      consultant: countConsultant,
    },
  });
});
const handle_admin_get_user_by_id = catchAsync(async (req, res, next) => {
  const { lang } = req.query;
  const notFound = lang === "ar" ? "المستخدم غير موجود" : "User not found";
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const users = await userModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "usertypes", // ⚠️ replace with the actual collection name
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: {
        path: "$role",
        preserveNullAndEmptyArrays: true, // allows role to be null if not found
      },
    },
    {
      $project: {
        password: 0,
        vocation: 0,
        model: 0,

        verificationCode: 0,
        access: 0,

        userGroups: 0,
        projects: 0,
        signature: 0,
        electronicStamp: 0,
        companyLogo: 0,
        updatedAt: 0,
        createdAt: 0,
        userType: 0,
        tags: 0,
        renewalSubscription: 0,
        renewalSubscription: 0,
        notifications: 0,
        offersAndPackages: 0,
        twoWayAuthentication: 0,
        confirmedPhone: 0,
        verified: 0,
        plan: 0,
        team: 0,
      },
    },
  ]);

  const user = users[0];

  if (!user) {
    return res.status(404).json({ message: notFound });
  }
  const projects = await projectModel.aggregate([
    {
      $match: {
        members: { $in: [new mongoose.Types.ObjectId(id)] },
      },
    },
    {
      $lookup: {
        from: "users", // ⚠️ replace with your actual collection name for users
        localField: "members",
        foreignField: "_id",
        as: "members",
      },
    },
    {
      $project: {
        name: 1,
        tasks: 1,
        progress: 1,
        members: {
          $map: {
            input: "$members",
            as: "member",
            in: {
              _id: "$$member._id",
              profilePic: "$$member.profilePic",
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    message:
      lang === "ar"
        ? "تم العثور على المستخدم بنجاح"
        : "User found successfully",
    projects,
    user: user,
  });
});

const handle_admin_get_tasks = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const matchStage = search
    ? { $match: { taskStatus: search } }
    : { $match: {} };

  const tasks = await taskModel.aggregate([
    matchStage,

    // Lookup for assignees
    {
      $lookup: {
        from: "users",
        localField: "assignees",
        foreignField: "_id",
        as: "assignees",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    },

    // Format data like select() + populate()
    {
      $project: {
        title: 1,
        taskStatus: 1,
        sDate: 1,
        dueDate: 1,
        assignees: {
          $map: {
            input: "$assignees",
            as: "assignee",
            in: {
              name: "$$assignee.name",
              profilePic: "$$assignee.profilePic",
            },
          },
        },
        createdBy: {
          name: "$createdBy.name",
          profilePic: "$createdBy.profilePic",
        },
        tags: {
          $map: {
            input: "$tags",
            as: "tag",
            in: {
              name: "$$tag.name",
              color: "$$tag.colorCode",
            },
          },
        },
      },
    },

    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  // For total count (without pagination)
  const total = await taskModel.countDocuments(
    search ? { taskStatus: search } : {}
  );

  res.status(200).json({
    message: "Tasks found successfully",
    data: tasks,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
});
const handle_admin_get_tasks_by_id = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const tasks = await taskModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },

    // Lookup createdBy
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Lookup assignees
    {
      $lookup: {
        from: "users",
        localField: "assignees",
        foreignField: "_id",
        as: "assignees",
      },
    },

    // Lookup project
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
      },
    },
    {
      $unwind: {
        path: "$project",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Final projection
    {
      $project: {
        title: 1,
        description: 1,
        taskStatus: 1,
        dueDate: 1,
        sDate: 1,
        createdBy: {
          name: "$createdBy.name",
        },
        assignees: {
          $map: {
            input: "$assignees",
            as: "a",
            in: {
              name: "$$a.name",
            },
          },
        },
        project: {
          name: "$project.name",
        },
      },
    },
  ]);

  if (!tasks.length) {
    return res.status(404).json({ message: "task not found" });
  }

  res.status(200).json({
    message: "task found successfully",
    data: tasks[0],
  });
});

const handle_admin_get_projects = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 10; // default limit 10
  const skip = (page - 1) * limit;

  const projects = await projectModel.aggregate([
    {
      $project: {
        status: 1,
        name: 1,
        budget: 1,
        projectPriority: 1,
        sDate: 1,
        dueDate: 1,
        tasks: 1,
        members: 1,
        progress: 1,
      },
    },
    {
      $lookup: {
        from: "users", // the name of the collection (not model)
        localField: "members",
        foreignField: "_id",
        as: "members",
        pipeline: [{ $project: { profilePic: 1 } }],
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await projectModel.countDocuments();

  res.status(200).json({
    message: "Projects fetched successfully",
    data: projects,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});
const handle_admin_get_projects_by_id = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const objectId = new mongoose.Types.ObjectId(id);

  const project = await projectModel.aggregate([
    {
      $match: { _id: objectId }
    },
    {
      $lookup: {
        from: "users",
        localField: "consultant",
        foreignField: "_id",
        as: "consultant",
        pipeline: [
          { $project: { name: 1, profilePic: 1 } }
        ]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          { $project: { name: 1, profilePic: 1 } }
        ]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "contractor",
        foreignField: "_id",
        as: "contractor",
        pipeline: [
          { $project: { name: 1, profilePic: 1 } }
        ]
      }
    },
    // Convert single-element arrays to objects
    {
      $addFields: {
        consultant: { $arrayElemAt: ["$consultant", 0] },
        owner: { $arrayElemAt: ["$owner", 0] },
        contractor: { $arrayElemAt: ["$contractor", 0] }
      }
    }
  ]);

  if (!project.length)
    return res.status(404).json({ message: "Project not found" });

  res.status(200).json({
    message: "Project fetched successfully",
    data: project[0]
  });
});


export {
  handle_admin_signin,
  handle_admin_verify,
  handle_admin_resend_otp,
  handle_admin_get_users,
  handle_admin_get_user_by_id,
  handle_admin_get_tasks,
  handle_admin_get_tasks_by_id,
  handle_admin_get_projects,
  handle_admin_get_projects_by_id,
};
