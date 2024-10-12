import { tableModel } from "../../../database/models/table.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createTable = catchAsync(async (req, res, next) => {
  // req.body.model = "66ba010fecc8dae4bda821c9";

  const newTable = new tableModel(req.body);
  if(req.body.price <= 0 || req.body.quantity <= 0){
    return res.status(400).json({message:"price and quantity should be greater than 0"})
  }else{
    req.body.total = req.body.price * req.body.quantity
  }
  const savedTable = await newTable.save();

  res.status(201).json({
    message: "Table created successfully!",
    savedTable,
  });
});

const getAllTable = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(tableModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Table was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllTableById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await tableModel.findById(id);
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "Done", results });
});
const updateTable = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let {task ,quantity,description,sDate,eDate,price,total,units,tag,priority,filteredQuantity,requiredQuantity,approvedQuantity,executedQuantity,assignees} = req.body;
  const updatedTable = await tableModel.findByIdAndUpdate(id,
     {
      task,quantity,description,sDate,eDate,price,total,units,tag,priority,filteredQuantity,requiredQuantity,approvedQuantity,executedQuantity, $push:{assignees}
     }, {
    new: true,
  });
  if (!updatedTable) {
    return res.status(404).json({ message: "Table not found!" });
  }
  res.status(200).json({
    message: "Table updated successfully!",
    updatedTable,
  });
});
const updateTablePull = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let {assignees} = req.body;
  const updatedTable = await tableModel.findByIdAndUpdate(id,
     {
      $pull:{assignees}
     }, {
    new: true,
  });
  if (!updatedTable) {
    return res.status(404).json({ message: "Table not found!" });
  }
  res.status(200).json({
    message: "Table updated successfully!",
    updatedTable,
  });
});
const deleteTable = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteTable = await tableModel.findByIdAndDelete(id);
  if (!deleteTable) {
    return res.status(404).json({ message: "Table not found!" });
  }
  res.status(200).json({
    message: "Table Deleted successfully!",
    deleteTable,
  });
});

export {
  createTable,
  getAllTable,
  updateTable,
  deleteTable,
  getAllTableById,
  updateTablePull,
};
