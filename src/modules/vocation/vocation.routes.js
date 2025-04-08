import express from "express";

import {
  getAllVocations,
  addVocation,
  updateVocation,
  deleteVocation,
  getAllVocationsByCreatedBy,
} from "./vocation.controller.js";
const vocationRoute = express.Router();

vocationRoute.post("/", addVocation);
vocationRoute.get("/", getAllVocations);
vocationRoute.get("/user/:id", getAllVocationsByCreatedBy);
vocationRoute.put("/:id", updateVocation);
vocationRoute.delete("/:id", deleteVocation);

export default vocationRoute;
