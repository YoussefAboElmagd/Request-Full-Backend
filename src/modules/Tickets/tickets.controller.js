import { ticketModel } from "../../../database/models/ticket.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createTicket = catchAsync(async (req, res, next) => {
  const newData = new ticketModel(req.body);
  const savedData = await newData;
  savedData.users.push(savedData.createdBy);
  savedData.users = savedData.users.filter(
    (item, index) => savedData.users.indexOf(item) === index
  );
  await savedData.save();
  res.status(201).json({
    message: "Tickets created successfully!",
    savedData,
  });
});

const getAllTickets = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(ticketModel.find(), req.query).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Tickets was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
const getTicketById = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    ticketModel.findById(req.params.id),
    req.query
  ).search();
  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Tickets was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const updateTickets = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // let { users, tags, rights, name } = req.body;
  const updatedTickets = await ticketModel.findByIdAndUpdate(id, req.body, {new: true,});
  if (!updatedTickets) {
    return res.status(404).json({ message: "Tickets not found!" });
  }
  res.status(200).json({
    message: "Tickets updated successfully!",
    updatedTickets,
  });
});
const updateUserGroup2 = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let { users, tags, rights } = req.body;
  const updatedTickets = await ticketModel.findByIdAndUpdate(
    id,
    {
      $pull: {
        users,
        tags,
        rights,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedUserGroup) {
    return res.status(404).json({ message: "Tickets not found!" });
  }
  res.status(200).json({
    message: "Tickets updated successfully!",
    updatedUserGroup,
  });
});
const deleteTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleteTicket = await ticketModel.findByIdAndDelete(id);
  if (!deleteTicket) {
    return res.status(404).json({ message: "Tickets not found!" });
  }
  res.status(200).json({
    message: "Tickets Deleted successfully!",
    deleteTicket,
  });
});

export {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTickets,
  deleteTicket,
  updateTickets2,
};
