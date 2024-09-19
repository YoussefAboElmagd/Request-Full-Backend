import mongoose from "mongoose";

const vocationSchema = new mongoose.Schema({
  name: {type : String,
    required : true
  }
},{
  timestamps : true
})

const vocationModel = mongoose.model("vocation",vocationSchema)

export default vocationModel;