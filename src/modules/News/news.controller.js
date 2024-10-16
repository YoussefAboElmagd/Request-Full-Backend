import { newsModel } from "../../../database/models/news.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createNews = catchAsync(async (req, res, next) => {
  req.body.model = "66ba010fecc8dae4bda821c9";

  const newComp = new newsModel(req.body);
  const savedData = await newComp.save();

  res.status(201).json({
    message: "News created successfully!",
    savedData,
  });
});

const getAllNews = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(newsModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No News was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateNews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedNews = await newsModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedNews) {
    return res.status(404).json({ message: "News not found!" });
  }
  res.status(200).json({
    message: "News updated successfully!",
    updatedNews,
  });
});
const deleteNews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteNews = await newsModel.findByIdAndDelete(id);
  if (!deleteNews) {
    return res.status(404).json({ message: "News not found!" });
  }
  res.status(200).json({
    message: "News Deleted successfully!",
    deleteNews,
  });
});

export { createNews, getAllNews, updateNews, deleteNews };
