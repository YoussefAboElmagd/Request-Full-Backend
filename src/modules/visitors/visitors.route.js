import express from "express";

import {
  addNewVisitor,
  countVisitors,
} from "./visitors.controller.js";
const routerVisitors = express.Router();

routerVisitors.post("/add-visitor", addNewVisitor);
routerVisitors.post("/count-visitor", countVisitors);

export default routerVisitors;
