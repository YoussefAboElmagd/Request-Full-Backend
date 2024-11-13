import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getAllTaskLogByTask = catchAsync(async (req, res, next) => {
  let err_1 = "Task not found!"
  if(req.query.lang == "ar"){
    err_1 = "المهمة غير موجودة"
  }
  let ApiFeat = new ApiFeature(
    taskLogModel.find({ taskId: req.params.id }).sort({ $natural: -1 }),
    req.query
  )
    .sort()
    .search();

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
  }
  res.json({
    message: "Done",
    results,
  });
});

export { getAllTaskLogByTask };