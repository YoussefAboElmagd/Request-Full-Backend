import {vocationModel} from "../../../database/models/vocation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";


const getAllVocations = catchAsync( async (req,res) => {
    const allVocations = await vocationModel.find()
    res.json({message:'Done',allVocations})
})
const addVocation = catchAsync(async (req,res) => {
    const added = new vocationModel(req.body)
    const saved = await added.save()
    res.json({message : 'Added',saved})
})
const getAllVocationsByCreatedBy = catchAsync(async (req, res, next) => {
  let err = "No vocation was found!"
  if(req.query.lang == "ar"){
    err = "لا يوجد مهنة لهذا المستخدم"
  }
    let ApiFeat = new ApiFeature(
      vocationModel.find({ createdBy: req.params.id }),
      req.query
    ).search();
    let results = await ApiFeat.mongooseQuery;
    results = JSON.stringify(results);
    results = JSON.parse(results);
    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: err,
      });
    }
    res.json({
      message: "Done",
      results,
    });
  });
const updateVocation = catchAsync(async (req,res) => {
    let {id} = req.params;
    let {name} = req.body;
    let err = "No vocation was found!"
    if(req.query.lang == "ar"){
      err = "لا يوجد مهنة  "
    }
    const updated = await vocationModel.findByIdAndUpdate(id,{name}, {new:true})
    if(updated){
        res.json({message : 'Name Updated Successfully',updated})
    }else{
        res.status(404),res.json({message : err})
    }
})
const deleteVocation = catchAsync(async (req,res) => {
    let {id} = req.params;
    let {name} = req.body;
    let err = "No vocation was found!"
    if(req.query.lang == "ar"){
      err = "لا يوجد مهنة  "
    }
    const deleted = await vocationModel.findByIdAndDelete(id,{name}, {new:true})
    if(deleted){
        res.json({message : 'Deleted Successfully'})
    }else{
        res.status(404),res.json({message : err})
    }
})










export {getAllVocations,updateVocation,addVocation,deleteVocation,getAllVocationsByCreatedBy};