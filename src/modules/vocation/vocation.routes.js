import express from 'express'

import { getAllVocations,addVocation, updateVocation, deleteVocation} from './vocation.controller.js'
const vocationRoute = express.Router()


vocationRoute.post("/",addVocation)
vocationRoute.get("/",getAllVocations)
vocationRoute.put("/:id",updateVocation)
vocationRoute.delete("/:id",deleteVocation)




export default vocationRoute;
