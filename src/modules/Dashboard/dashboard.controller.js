import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllDashboard = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(DashboardCodeModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Dashboard was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateDashboard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedDashboard = await DashboardCodeModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedDashboard) {
    return res.status(404).json({ message: "Dashboard not found!" });
  }
  res.status(200).json({
    message: "Dashboard updated successfully!",
    updatedDashboard,
  });
});


export {  getAllDashboard, updateDashboard,  };
