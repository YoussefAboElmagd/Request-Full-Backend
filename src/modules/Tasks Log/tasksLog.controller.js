import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllTaskLogByTask = catchAsync(async (req, res, next) => {
  let err_1 = "Task not found!"
  let ApiFeat = null
  ApiFeat = new ApiFeature(
    taskLogModel.find({ taskId: req.params.id }).sort({ $natural: -1 }).select("updates.changes_en updates.date"),
    req.query
  )
    .sort()
    .search();
    if(req.query.lang == "ar"){
    ApiFeat = new ApiFeature(
      taskLogModel.find({ taskId: req.params.id }).sort({ $natural: -1 }).select("updates.changes_ar updates.date"),
      req.query
    )
      .sort()
      .search();
    err_1 = "المهمة غير موجودة"
  }

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: err_1,
    });
  }
  if(results.length>0){
    results=results[0]
    results.updates.forEach(update => {
      if (update.changes_ar !== undefined) {
          update.changes = update.changes_ar; // Copy changes_ar to schanges
          delete update.changes_ar; // Remove changes_ar
      }
      if (update.changes_en !== undefined) {
          update.changes = update.changes_en; // Copy changes_en to schanges
          delete update.changes_en; // Remove changes_en
      }
  });
}
  res.json({
    message: "Done",
    results,
  });
});

export { getAllTaskLogByTask };