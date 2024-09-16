import express from 'express';
import { addreasons, deletereasons, getallreasons, updatereasons } from './reason.controller.js';

const reasonroute = express.Router()

reasonroute.get("/",getallreasons)
reasonroute.post("/",addreasons)
reasonroute.put("/:id",updatereasons)
reasonroute.delete("/:id",deletereasons)











export default reasonroute;