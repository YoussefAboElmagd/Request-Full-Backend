import reasonmodel from "../../../database/models/reason.model.js"
import catchAsync from "../../utils/middleWare/catchAsyncError.js"


const getallreasons =catchAsync( async (req,res) => {
  const reasons = await reasonmodel.find()
  res.json({message : "Done",reasons})
})
const addreasons =catchAsync( async (req,res) => {
  const added = new reasonmodel(req.body)
  const newReason = await added.save()
  res.json({message:"added seccesfully",newReason})
})
const updatereasons =catchAsync( async (req,res) => {
  let {id}= req.params;
  const updated = await reasonmodel.findByIdAndUpdate(id,req.body,{new:true})
  if(updated){
    res.json({message:'updated',updated})
  }else{
    res.status(404).json({message:"id not found"})
  }

})
const deletereasons =catchAsync( async (req,res) => {
  let {id}= req.params;
  const deleted = await reasonmodel.findByIdAndDelete(id)
  if(deleted){
    res.json({message:'deleted'})
  }else{
    res.status(404).json({message:"id not found"})
  }
  
 
})

export { getallreasons,addreasons,updatereasons,deletereasons };