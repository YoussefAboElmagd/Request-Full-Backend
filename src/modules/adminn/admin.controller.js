import { userModel } from "../../../database/models/user.model.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail, sendEmailTOAssistant } from "../../email/sendEmail.js";
import { userTypeModel } from "../../../database/models/userType.model.js";
import mongoose from "mongoose";
import { projectModel } from "../../../database/models/project.model.js";
import { taskModel } from "../../../database/models/tasks.model.js";
import { requsetModel } from "../../../database/models/request.model.js";
import { ticketModel } from "../../../database/models/ticket.model.js";
import { documentsModel } from "../../../database/models/documents.model.js";
import { teamModel } from "../../../database/models/team.model.js";
import { sendNotification } from "../../utils/sendNotification.js";

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

  if (emailExist.userType != "admin" && emailExist.userType != "assistant")
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

  if (emailExist.userType != "admin" && emailExist.userType != "assistant")
    return res.status(401).json({ message: authErr });

  if (emailExist.verificationCode != otp)
    return res.status(404).json({ message: otpErr });

  const token = jwt.sign(
    {
      id: emailExist._id,
      userType: emailExist.userType,
      email: emailExist.email,
      rights: emailExist.rights || [],
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );
  const user = await userModel
    .findOne({ email })
    .select("-password -verificationCode");
  user.lastLogin = new Date();
  await user.save();
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

  if (emailExist.userType != "admin" && emailExist.userType != "assistant")
    return res.status(401).json({ message: authErr });

  const nanoid = customAlphabet("0123456789", 4);

  const fourDigitCode = nanoid();
  emailExist.verificationCode = fourDigitCode;
  await emailExist.save();
  sendEmail(email, `Email Verification Code:${fourDigitCode}`);
  res.status(200).json({ message: "otp sent successfully" });
});
const handle_admin_change_password = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password)
    return res.status(400).json({ message: "password is required" });

  const userExist = await userModel.findById(req.user.id);
  if (!userExist) return res.status(404).json({ message: "user not found" });

  const newPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  userExist.password = newPassword;
  await userExist.save();

  res.status(200).json({ message: "password updated successfully" });
});

const handle_admin_update_profile = catchAsync(async (req, res, next) => {
  const data = req.body;

  const id = req.user.id;

  const existAdmin = await userModel.findById(id);

  if (!existAdmin) return res.status(404).json({ message: "admin not found" });

  if (req.file) {
    existAdmin.profilePic = "profilePic/" + req.file.filename;
  }

  if (data.name) {
    existAdmin.name = data.name;
  }
  if (data.phone) {
    existAdmin.phone = data.phone;
  }
  if (data.email) {
    existAdmin.email = data.email;
  }
  await existAdmin.save();
  res.status(200).json({ message: "admin upadated successfully" });
});
const handle_admin_update_member = catchAsync(async (req, res, next) => {
  const { name, email, vocation, access, phone, userId } = req.body;

  const id = req.user.id;

  const existAdmin = await userModel.findById(id);

  if (!existAdmin) return res.status(404).json({ message: "admin not found" });

  const memberFound = await userModel.findOne({
    _id: userId,
    userType: "assistant",
  });

  if (!memberFound)
    return res.status(404).json({ message: "member not found" });

  const emailExist = await userModel.findOne({
    _id: { $ne: userId },
    email: email,
  });
  const phoneExist = await userModel.findOne({
    _id: { $ne: userId },
    phone: phone,
  });

  if (emailExist) return res.status(409).json({ message: "email exist" });
  if (phoneExist) return res.status(409).json({ message: "phone exist" });

  await userModel.findByIdAndUpdate(userId, {
    name,
    email,

    phone,
    memberVocation: vocation,
    rights: access,
  });

  res.status(200).json({ message: "member upadated successfully" });
});

const handle_admin_get_users = catchAsync(async (req, res, next) => {
  // Use aggregation instead of find
  const search = req.query.search;

  // Build the aggregation pipeline
  const pipeline = [
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
  ];

  // Add search functionality if search query exists
  if (search && search.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "role.jobTitle": { $regex: search, $options: "i" } },
          { personalNumber: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Add projection
  pipeline.push({
    $project: {
      profilePic: 1,
      name: 1,
      email: 1,
      personalNumber: 1,
      role: {
        jobTitle: "$role.jobTitle",
      },
    },
  });

  const users = await userModel.aggregate(pipeline);
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
      },
    },
  ]);

  const user = users[0];

  if (!user) {
    return res.status(404).json({ message: notFound });
  }
  if (user?.team) {
    const team = await teamModel
      .findById(user?.team)
      .populate("members", "-password");
    user.team = team;
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
        status: 1,
        members: {
          $map: {
            input: "$members",
            as: "member",
            in: {
              _id: "$$member._id",
              profilePic: "$$member.profilePic",
              name: "$$member.name",
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
const handle_admin_delete_user = catchAsync(async (req, res, next) => {
  const { lang } = req.query;
  const notFound = lang === "ar" ? "المستخدم غير موجود" : "User not found";
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const user = await userModel.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({ message: notFound });
  }

  res.status(200).json({
    message:
      lang === "ar" ? "تم  حذف المستخدم بنجاح" : "User deleted successfully",
  });
});

const handle_admin_get_tasks = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build dynamic match stage based on search
  let matchStage = { $match: {} };

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i"); // Case-insensitive search

    matchStage = {
      $match: {
        $or: [
          { title: searchRegex },
          { taskStatus: searchRegex },
          // For date searches, we'll handle both string and date formats
          { sDate: searchRegex },
          { dueDate: searchRegex },
        ],
      },
    };
  }

  const tasks = await taskModel.aggregate([
    // First lookup users for assignees and createdBy
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
    {
      $lookup: {
        from: "documents",
        localField: "_id", // task _id
        foreignField: "task", // documents.task field
        as: "documents",
      },
    },

    // Apply search filter after lookups (to search in populated fields)
    ...(search && search.trim()
      ? [
          {
            $match: {
              $or: [
                { title: new RegExp(search.trim(), "i") },
                { taskStatus: new RegExp(search.trim(), "i") },
                { sDate: new RegExp(search.trim(), "i") },
                { dueDate: new RegExp(search.trim(), "i") },
                { "assignees.name": new RegExp(search.trim(), "i") },
                { "createdBy.name": new RegExp(search.trim(), "i") },
                { "tags.name": new RegExp(search.trim(), "i") },
              ],
            },
          },
        ]
      : []),

    // Add facet for total count and paginated results
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
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
              documents: {
                $map: {
                  input: "$documents",
                  as: "doc",
                  in: {
                    link: "$$doc.path",
                    createdAt: "$$doc.createdAt",
                  },
                },
              },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const result = tasks[0];
  const data = result.data;
  const total = result.totalCount[0]?.count || 0;

  res.status(200).json({
    message: "Tasks found successfully",
    data: data,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
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
  const search = req.query.search;

  // Build search query
  let searchQuery = {};

  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchRegex = new RegExp(searchTerm, "i");

    // Build search conditions array
    const searchConditions = [
      { name: searchRegex },
      { status: searchRegex },
      { projectPriority: searchRegex },
    ];

    // Handle numeric fields
    const numericValue = parseFloat(searchTerm);
    if (!isNaN(numericValue)) {
      searchConditions.push({ budget: numericValue });
      searchConditions.push({ progress: numericValue });
    }

    // Handle date fields - try to parse as date
    const dateValue = new Date(searchTerm);
    if (!isNaN(dateValue.getTime())) {
      searchConditions.push({ sDate: dateValue });
      searchConditions.push({ dueDate: dateValue });
    }

    searchQuery = { $or: searchConditions };
  }

  const projects = await projectModel.find(searchQuery).populate("members");

  res.status(200).json({
    message: "Projects fetched successfully",
    data: projects,
  });
});

const handle_admin_get_requests = catchAsync(async (req, res, next) => {
  const data = await requsetModel.aggregate([
    // Populate consultant - only select name and profilePic
    {
      $lookup: {
        from: "users",
        localField: "consultant",
        foreignField: "_id",
        as: "consultant",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$consultant", preserveNullAndEmptyArrays: true } },

    // Populate contractor - only select name and profilePic
    {
      $lookup: {
        from: "users",
        localField: "contractor",
        foreignField: "_id",
        as: "contractor",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$contractor", preserveNullAndEmptyArrays: true } },

    // Populate owner - only select name and profilePic
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },

    // Populate createdBy - only select name and profilePic
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              profilePic: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
  ]);

  res.status(200).json({
    message: "Requests fetched successfully",
    data,
  });
});

const handle_admin_get_requests_most_use = catchAsync(
  async (req, res, next) => {
    // Date calculations for weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const [SubmittalRequest, TOF, Matrial, work, inspection] =
      await Promise.all([
        requsetModel.countDocuments({ type: "requestForDocumentSubmittal" }),
        requsetModel.countDocuments({ type: "tableOfQuantity" }),
        requsetModel.countDocuments({ type: "requestForMaterialAndEquipment" }),
        requsetModel.countDocuments({ type: "workRequest" }),
        requsetModel.countDocuments({ type: "requestForInspaction" }),
      ]);

    const totalMostOfUsed =
      SubmittalRequest + TOF + Matrial + work + inspection;

    const [
      totalUsers,
      totalProjects,
      totalTasks,
      totlaTickets,
      thisWeekUsers,
      previousWeekUsers,
      thisWeekProjects,
      previousWeekProjects,
      thisWeekTasks,
      previousWeekTasks,
      thisWeekTickets,
      previousWeekTickets,
    ] = await Promise.all([
      userModel.countDocuments({ userType: { $ne: "admin" } }),
      projectModel.countDocuments(),
      taskModel.countDocuments(),
      ticketModel.countDocuments(),
      // Users created in the last week
      userModel.countDocuments({
        userType: { $ne: "admin" },
        createdAt: { $gte: oneWeekAgo },
      }),
      // Users created in the week before that
      userModel.countDocuments({
        userType: { $ne: "admin" },
        createdAt: {
          $gte: twoWeeksAgo,
          $lt: oneWeekAgo,
        },
      }),
      // Projects created in the last week
      projectModel.countDocuments({
        createdAt: { $gte: oneWeekAgo },
      }),
      // Projects created in the week before that
      projectModel.countDocuments({
        createdAt: {
          $gte: twoWeeksAgo,
          $lt: oneWeekAgo,
        },
      }),
      // Tasks created in the last week
      taskModel.countDocuments({
        createdAt: { $gte: oneWeekAgo },
      }),
      // Tasks created in the week before that
      taskModel.countDocuments({
        createdAt: {
          $gte: twoWeeksAgo,
          $lt: oneWeekAgo,
        },
      }),
      // Tickets created in the last week
      ticketModel.countDocuments({
        createdAt: { $gte: oneWeekAgo },
      }),
      // Tickets created in the week before that
      ticketModel.countDocuments({
        createdAt: {
          $gte: twoWeeksAgo,
          $lt: oneWeekAgo,
        },
      }),
    ]);

    // Calculate weekly statistics for all entities
    const calculateWeeklyStats = (thisWeek, previousWeek, total) => ({
      thisWeek,
      previousWeek,
      growthRate:
        previousWeek > 0
          ? parseFloat(
              (((thisWeek - previousWeek) / previousWeek) * 100).toFixed(2)
            )
          : thisWeek > 0
          ? 100
          : 0,
      percentageOfTotal:
        total > 0 ? parseFloat(((thisWeek / total) * 100).toFixed(2)) : 0,
    });

    const userStats = calculateWeeklyStats(
      thisWeekUsers,
      previousWeekUsers,
      totalUsers
    );
    const projectStats = calculateWeeklyStats(
      thisWeekProjects,
      previousWeekProjects,
      totalProjects
    );
    const taskStats = calculateWeeklyStats(
      thisWeekTasks,
      previousWeekTasks,
      totalTasks
    );
    const ticketStats = calculateWeeklyStats(
      thisWeekTickets,
      previousWeekTickets,
      totlaTickets
    );

    const topFiveNewestUsers = await userModel.aggregate([
      {
        $match: { userType: { $ne: "admin" } },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "usertypes",
          localField: "role",
          foreignField: "_id",
          as: "roleData",
        },
      },
      {
        $unwind: "$roleData",
      },
      {
        $project: {
          name: 1,
          profilePic: 1,
          email: 1,
          createdAt: 1,
          role: "$roleData.jobTitle",
        },
      },
    ]);

    res.status(200).json({
      message: "Request counts fetched successfully",
      data: {
        most: [
          { title: "Work Request", value: (work / totalMostOfUsed) * 100 },
          { title: "Table Of Quantity", value: (TOF / totalMostOfUsed) * 100 },
          {
            title: "Request For Material And Equipment",
            value: (Matrial / totalMostOfUsed) * 100,
          },
          {
            title: "Request For Document Submittal",
            value: (SubmittalRequest / totalMostOfUsed) * 100,
          },
          {
            title: "Request For Inspection(RFI)",
            value: (inspection / totalMostOfUsed) * 100,
          },
        ],
        cards: [
          {
            title: "Users",
            total: totalUsers,
            ...userStats,
          },
          {
            title: "Projects",
            total: totalProjects,
            ...projectStats,
          },
          {
            title: "Tasks",
            total: totalTasks,
            ...taskStats,
          },
          {
            title: "Tickets",
            total: totlaTickets,
            ...ticketStats,
          },
        ],
        weeklyStats: {
          users: userStats,
          projects: projectStats,
          tasks: taskStats,
          tickets: ticketStats,
        },
        topFiveNewestUsers,
      },
    });
  }
);

const handle_admin_get_requests_by_id = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // const request = await requsetModel.aggregate([
  //   {
  //     $match: { _id: new mongoose.Types.ObjectId(id) },
  //   },
  //   {
  //     $lookup: {
  //       from: "users", // assuming your user collection name is "users"
  //       localField: "owner",
  //       foreignField: "_id",
  //       as: "owner",
  //       pipeline: [
  //         {
  //           $project: {
  //             name: 1,
  //             profilePic: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "consultant",
  //       foreignField: "_id",
  //       as: "consultant",
  //       pipeline: [
  //         {
  //           $project: {
  //             name: 1,
  //             profilePic: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "contractor",
  //       foreignField: "_id",
  //       as: "contractor",
  //       pipeline: [
  //         {
  //           $project: {
  //             name: 1,
  //             profilePic: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "createdBy",
  //       foreignField: "_id",
  //       as: "createdBy",
  //       pipeline: [
  //         {
  //           $project: {
  //             name: 1,
  //             profilePic: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "units", // assuming your unit collection name is "units"
  //       localField: "unit",
  //       foreignField: "_id",
  //       as: "unit",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "disciplines", // assuming your discipline collection name is "disciplines"
  //       localField: "discipline",
  //       foreignField: "_id",
  //       as: "discipline",
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$owner",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$consultant",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$contractor",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$createdBy",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$unit",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$discipline",
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  // ]);

  const request = await requsetModel.findById(id).populate("project");
  if (!request) {
    return res.status(404).json({ message: "request not found" });
  }

  res
    .status(200)
    .json({ message: "request found successfully", data: request });
});

const handle_admin_get_projects_by_id = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  const objectId = new mongoose.Types.ObjectId(id);

  const project = await projectModel.aggregate([
    {
      $match: { _id: objectId },
    },
    {
      $lookup: {
        from: "users",
        localField: "consultant",
        foreignField: "_id",
        as: "consultant",
        pipeline: [{ $project: { name: 1, profilePic: 1 } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { name: 1, profilePic: 1 } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "contractor",
        foreignField: "_id",
        as: "contractor",
        pipeline: [{ $project: { name: 1, profilePic: 1 } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [{ $project: { name: 1, profilePic: 1, email: 1 } }],
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "tasks",
        foreignField: "_id",
        as: "tasks",
        // pipeline: [{ $project: { title: 1, status: 1, deadline: 1 } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "members",
        pipeline: [{ $project: { name: 1, profilePic: 1 } }],
      },
    },
    {
      $addFields: {
        consultant: { $arrayElemAt: ["$consultant", 0] },
        owner: { $arrayElemAt: ["$owner", 0] },
        contractor: { $arrayElemAt: ["$contractor", 0] },
        createdBy: { $arrayElemAt: ["$createdBy", 0] },
      },
    },
  ]);

  if (!project.length)
    return res.status(404).json({ message: "Project not found" });

  const tags = await taskModel.find({ project: id }).select("tags");
  const filtered = tags.filter((ele) => ele.tags != null);

  // Step 1: Extract simplified tag data
  const simplifiedTags = filtered.map((ele) => ({
    name: ele.tags.name,
    colorCode: ele.tags.colorCode,
  }));

  // Step 2: Count frequency and track colorCode
  const counts = {};
  const colors = {};

  simplifiedTags.forEach(({ name, colorCode }) => {
    counts[name] = (counts[name] || 0) + 1;
    if (!colors[name]) colors[name] = colorCode; // Save colorCode on first occurrence
  });

  // Step 3: Total number of tags
  const total = simplifiedTags.length;

  // Step 4: Build final array with name, colorCode, and percentage
  const result = Object.entries(counts).map(([name, count]) => ({
    name,
    colorCode: colors[name],
    percentage: parseFloat(((count / total) * 100).toFixed(2)),
  }));

  let docs = [];
  project[0].tags = result;
  console.log(project[0].tasks);

  if (project[0]?.tasks && project[0]?.tasks?.length) {
    for (const task of project[0]?.tasks) {
      const newdocs = await documentsModel
        .find({ task: task._id })
        .select("path createdAt");
      docs = [...docs, ...newdocs];
    }
  }

  project[0].docs = docs;

  res.status(200).json({
    message: "Project fetched successfully",
    data: project[0],
  });
});
const handle_admin_get_Tickets = catchAsync(async (req, res, next) => {
  const search = req.query.search;

  // Build the aggregation pipeline
  let pipeline = [];

  // Stage 1: Match based on user role
  let matchStage = {};
  if (req.user.role === "assistant") {
    matchStage.assignedTo = req.user.id;
  }

  // Add the initial match stage if there are conditions
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Stage 2: Lookup user details
  pipeline.push({
    $lookup: {
      from: "users", // Replace with your actual users collection name
      localField: "user",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $project: {
            name: 1,
            profilePic: 1,
          },
        },
      ],
    },
  });

  // Stage 3: Lookup assignedTo details
  pipeline.push({
    $lookup: {
      from: "users", // Replace with your actual users collection name
      localField: "assignedTo",
      foreignField: "_id",
      as: "assignedTo",
    },
  });

  // Stage 4: Unwind the arrays (since populate returns single objects)
  pipeline.push(
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$assignedTo",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  // Stage 5: Add search functionality if search query exists
  if (search) {
    const searchRegex = new RegExp(search, "i");

    pipeline.push({
      $match: {
        $or: [
          { ticketNumber: searchRegex },
          { subject: searchRegex },
          { status: searchRegex },
          { "user.name": searchRegex },
          { "assignedTo.name": searchRegex },
        ],
      },
    });
  }

  // Stage 6: Sort by creation date (newest first)
  pipeline.push({
    $sort: { createdAt: -1 },
  });

  // Execute the aggregation
  const tickets = await ticketModel.aggregate(pipeline);

  res.status(200).json({
    message: "Tickets fetched successfully",
    data: tickets,
  });
});

const handle_admin_get_Tickets_by_id = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tickets = await ticketModel
    .findById(id)
    .populate("assignedTo")
    .populate({
      path: "user",
      select: "name profilePic",
    });
  if (!tickets) return res.status(404).json({ message: "ticket not found" });
  res
    .status(200)
    .json({ message: "ticket founded successfully", data: tickets });
});
const handle_admin_response_Tickets_by_id = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const { response } = req.body;
    const tickets = await ticketModel
      .findById(id)

      .populate({
        path: "user",
        select: "name profilePic",
      });

    if (!tickets) return res.status(404).json({ message: "ticket not found" });
    tickets.response = response;
    await tickets.save();
    await sendEmail(tickets.email, response);
    res.status(200).json({ message: "message sent to user successfully" });
  }
);
const handle_admin_change_ticket_status = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["inProgress", "waiting", "solved"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be one of: ['inProgress', 'waiting', 'solved']",
    });
  }

  const ticket = await ticketModel
    .findByIdAndUpdate(id, { status }, { new: true })
    .populate({
      path: "user",
      select: "name profilePic",
    });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  res
    .status(200)
    .json({ message: "Ticket status updated successfully", ticket });
});
const handle_admin_assign_ticket = catchAsync(async (req, res, next) => {
  const { ticketId, assistantId } = req.body;
  console.log("sasasa");

  const ticket = await ticketModel.findById(ticketId);

  const userExist = await userModel.findById(assistantId);
  if (!userExist) return res.status(404).json({ message: "user not found" });
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  ticket.assignedTo = assistantId;
  await ticket.save();

  await sendNotification(
    `you have been assigned to new  tikcket and its number is ${ticket.ticketNumber} `,
    `تم تعيينك على تذكرة جديدة ورقمها هو ${ticket.ticketNumber}`,
    "success",
    assistantId,
    null,
    "ticket",
    ticket._id
  );
  res.status(200).json({
    message: `"Ticket assigned to ${userExist.name} successfully`,
  });
});
const handle_admin_get_tags = catchAsync(async (req, res, next) => {
  const tags = await taskModel.aggregate([
    {
      $project: { tags: 1 },
    },
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags._id",
        name: { $first: "$tags.name" },
        colorCode: { $first: "$tags.colorCode" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        tagId: "$_id",
        name: 1,
        colorCode: 1,
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({ message: "tags founded successfully", data: tags });
});

const adduserTeam = catchAsync(async (req, res, next) => {
  const { name, email, vocation, password, access, phone } = req.body;

  const emailExist = await userModel.findOne({ email });

  if (emailExist)
    return res.status(409).json({ message: "email already exist" });

  const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

  const createdUser = await userModel.create({
    name,
    email,
    memberVocation: vocation,
    password: hashedPassword,
    rights: access,
    phone: phone,
    userType: "assistant",
  });

  await userModel.findByIdAndUpdate(req.user.id, {
    $push: { teamMember: createdUser._id },
  });
  await sendEmailTOAssistant(email, password);

  res.status(201).json({ message: "user created successfully" });
});
const deleteuserTeam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExist = await userModel.findOne({ userType: "assistant", _id: id });
  if (!userExist) return res.status(404).json({ message: "user not found" });

  await userModel.findByIdAndUpdate(req.user.id, {
    $pull: { teamMember: id },
  });

  await userModel.findByIdAndDelete(id);

  res.status(201).json({ message: "user deleted successfully" });
});
const getTeam = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  // console.log(id);

  const userExits = await userModel
    .findById(id)
    .populate({ path: "teamMember", select: "-password" });
  if (!userExits) return res.status(404).json({ message: "user not found" });

  res.status(200).json({
    message: "team fetched successfully",
    data: userExits?.teamMember || [],
  });
});

export {
  handle_admin_get_tags,
  handle_admin_update_member,
  handle_admin_assign_ticket,
  getTeam,
  deleteuserTeam,
  adduserTeam,
  handle_admin_get_requests,
  handle_admin_change_ticket_status,
  handle_admin_response_Tickets_by_id,
  handle_admin_get_Tickets_by_id,
  handle_admin_update_profile,
  handle_admin_get_Tickets,
  handle_admin_signin,
  handle_admin_verify,
  handle_admin_resend_otp,
  handle_admin_change_password,
  handle_admin_get_users,
  handle_admin_get_user_by_id,
  handle_admin_get_tasks,
  handle_admin_get_tasks_by_id,
  handle_admin_get_projects,
  handle_admin_get_projects_by_id,
  handle_admin_delete_user,
  handle_admin_get_requests_most_use,
  handle_admin_get_requests_by_id,
};
