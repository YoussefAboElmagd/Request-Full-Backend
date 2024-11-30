import {vocationModel} from "../../../database/models/vocation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";


const getAllVocations = catchAsync( async (req,res) => {
    const allVocations = await vocationModel.find()
      //   results.forEach(update => {
  //     if (update.nameAR !== undefined) {
  //         update.name = update.nameAR; 
  //         delete update.nameAR; 
  //     }
  //     if (update.nameEN !== undefined) {
  //         update.name = update.nameEN; 
  //         delete update.nameEN; 
  //     }
  // });
    res.json({message:'Done',allVocations})
})
const addVocation = catchAsync(async (req,res) => {
    const added = new vocationModel(req.body)
    const saved = await added.save()
    res.json({message : 'Added',saved})
})
const getAllVocationsByCreatedBy = catchAsync(async (req, res, next) => {
  let err = "No vocation was found!"
  let ApiFeat = null;
  let defaultQuery = null;
  if(req.query.lang == "ar"){
    err = "لا يوجد مهنة لهذا المستخدم"
    defaultQuery = await vocationModel.find().limit(8).select('nameAR _id createdBy');
    ApiFeat = new ApiFeature(
      vocationModel.find({ createdBy: req.params.id }).select('nameAR _id createdBy'),
      req.query
    ).search();
  }
  defaultQuery = await vocationModel.find().limit(8).select('nameEN _id createdBy');
    ApiFeat = new ApiFeature(
      vocationModel.find({ createdBy: req.params.id }).select('nameEN _id createdBy'),
      req.query
    ).search();
    let result = await ApiFeat.mongooseQuery;
    result = JSON.stringify(result);
    result = JSON.parse(result);
    if (!ApiFeat || !result) {
      return res.status(404).json({
        message: err,
      });
    }
    let results = defaultQuery.concat(result);
    results.forEach(update => {
      if (update.nameAR !== undefined) {
          update.name = update.nameAR; 
          delete update.nameAR; 
      }
      if (update.nameEN !== undefined) {
          update.name = update.nameEN; 
          delete update.nameEN; 
      }
  });
    res.json({
      message: "Done",
      results,
    });
  });
const updateVocation = catchAsync(async (req,res) => {
    let {id} = req.params;
    let err = "No vocation was found!"
    if(req.query.lang == "ar"){
      err = "لا يوجد مهنة  "
    }
    const updated = await vocationModel.findByIdAndUpdate(id,req.body, {new:true})
    if(updated){
        return res.json({message : 'Name Updated Successfully',updated})
    }else{
        return res.status(404),res.json({message : err})
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
        return res.json({message : 'Deleted Successfully'})
    }else{
        return res.status(404),res.json({message : err})
    }
})










export {getAllVocations,updateVocation,addVocation,deleteVocation,getAllVocationsByCreatedBy};