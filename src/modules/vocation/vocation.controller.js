import {vocationModel} from "../../../database/models/vocation.model.js";
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
const updateVocation = catchAsync(async (req,res) => {
    let {id} = req.params;
    let {name} = req.body;
    const updated = await vocationModel.findByIdAndUpdate(id,{name}, {new:true})
    if(updated){
        res.json({message : 'Updated',updated})
    }else{
        res.status(404),res.json({message : 'id not found'})
    }
})
const deleteVocation = catchAsync(async (req,res) => {
    let {id} = req.params;
    let {name} = req.body;
    const deleted = await vocationModel.findByIdAndDelete(id,{name}, {new:true})
    if(deleted){
        res.json({message : 'Deleted'})
    }else{
        res.status(404),res.json({message : 'id not found'})
    }
})

























export {getAllVocations,updateVocation,addVocation,deleteVocation};