
import { planModel } from '../../../database/models/plan.model.js';
import catchAsync from '../../utils/middleWare/catchAsyncError.js';
const createPlan = catchAsync(async(req,res) => {

  let newPlan = new planModel(req.body);
  let savedPlan = await newPlan.save()
  res.json({message : "Done",savedPlan})
})
const getAllPlans = catchAsync(async (req,res) => {
  let getAll = await planModel.find()
  res.json({message : "Done",getAll})
})
const getPlanById = catchAsync(async (req,res) => {
  let {id} = req.params;
  let getPlan = await planModel.findById(id)
  if(getPlan){
    res.json({message : "Done",getPlan})
  }else{
    res.json({message : "Id Not Found"})  
  }
})
const uptadePlan = catchAsync(async (req,res) => {
  let {id} = req.params;
  let updated = await planModel.findByIdAndUpdate(id,req.body,{new:true})
  res.json({message : "Updated",updated})
})
const deletePlan = catchAsync(async (req,res) => {
  let {id} = req.params;
  let deleted = await planModel.findByIdAndDelete(id)
  res.json({message : "Deleted"})
})














export{
  createPlan,
  getAllPlans,
  getPlanById,
  uptadePlan,
  deletePlan
}