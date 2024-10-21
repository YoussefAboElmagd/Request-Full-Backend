import { paymentModel } from "../../../database/models/payment.model.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
const createPayment = catchAsync(async (req,res) => {
  let newPayment = new paymentModel(req.body);
  let savedPayment = await newPayment.save();
  res.json({message : "Done",savedPayment})
});
const getPaymentByID = catchAsync(async (req,res) => {
  let {id} = req.params;
  let getById = await paymentModel.findById(id);
  if(getById){
    res.json({message : "Done",getById})
  }else{
    res.json({message : "Id Not Found"})
  }
});
const updatePayment = catchAsync(async (req,res) => {
  let {id} = req.params;
  let update = await paymentModel.findByIdAndUpdate(id,req.body,{new:true});
  res.json({message : "updated",update})
});
const deletePayment = catchAsync(async (req,res) => {
  let {id} = req.params;
  let update = await paymentModel.findByIdAndDelete(id);
  res.json({message : "deleted"})
});

export {
  createPayment,
  getPaymentByID,
  updatePayment,
  deletePayment
}