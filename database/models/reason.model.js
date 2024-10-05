import mongoose from "mongoose";

const reasonschema = new mongoose.Schema({
  name:
  {type:String,
  unique:true,
  required:true,
},
isSelected: {
  type: Boolean,
  default: false,
  required: true,
},
},{
  timestamps:true
})

const reasonmodel = mongoose.model("reason",reasonschema)

export default reasonmodel;
