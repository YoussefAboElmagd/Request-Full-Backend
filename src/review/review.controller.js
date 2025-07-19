import { reviewModel } from "../../database/models/review.model.js";
import { userModel } from "../../database/models/user.model.js";
import catchAsync from "../utils/middleWare/catchAsyncError.js";

export const createReview = catchAsync(async (req, res, next) => {
  const { userId, reviewText, rating } = req.body;
  const userExist = await userModel.findById(userId);
  if (!userExist) return res.status(404).json({ messsage: "user not found" });

  const data = await reviewModel.create({
    createdBy: userId,
    rating,
    text: reviewText,
  });

  res.status(201).json({ message: "reviewing created successfully" });
});
export const getReviews = catchAsync(async (req, res, next) => {
  const data = await reviewModel.aggregate([
    {
      $lookup: {
        from: "users", // Collection name of the referenced model (check the actual name in MongoDB, usually plural and lowercase)
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy", // Converts the array to an object (like populate does)
    },
    {
      $project: {
        _id: 1,
        text: 1, // Adjust according to your schema
        rating: 1, // Adjust as needed
        createdAt: 1,
        "createdBy._id": 1,
        "createdBy.name": 1,
        "createdBy.profilePic": 1,
      },
    },
  ]);

  res.status(200).json({ message: "Reviews fetched successfully", data });
});
