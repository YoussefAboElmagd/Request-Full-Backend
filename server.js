import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dbConnection from "./database/DBConnection.js";
import { init } from "./src/modules/index.js";
import { globalError } from "./src/utils/middleWare/globalError.js";
import cron from "node-cron"; // Import the node-cron library
import moment from "moment";
import { taskModel } from "./database/models/tasks.model.js";
import hpp from "hpp";
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    rejectUnauthorized: false,
  },
});
const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
  credentials: true, // Allow credentials to be sent with requests
};
app.use(cors(corsOptions));
app.use(hpp());  // Prevent HTTP Parameter Pollution  --> in case of query string parameters
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

dbConnection();
app.use((err, req, res, next) => {
  if (err.code === 'ENOTFOUND') {
    return res.status(500).send('Network error, please try again later.');
  }
  res.status(500).send(err.message);
});
init(app);
app.use(globalError);
// Schedule the cron job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to handle recurring tasks");

  try {
    const now = new Date();

    const tasks = await taskModel.find({
      type: "recurring",
      $or: [
        { recurrenceEndDate: { $exists: false } }, // No end date
        { recurrenceEndDate: { $gte: now } }, // End date not passed
      ],
    });

    // Process each recurring task
    for (const task of tasks) {
      const lastOccurrence = moment(task.createdAt);
      const nextOccurrence = lastOccurrence
        .add(task.recurrenceInterval, task.recurrenceUnit)
        .toDate();

      // If the next occurrence is due, create a new task
      if (nextOccurrence <= now) {
        const newTask = new taskModel({
          ...task.toObject(),
          _id: undefined, // Let MongoDB generate a new ID
          createdAt: now, // Set the current date for the new task
        });

        await newTask.save();
        console.log(`Created recurring task for task ID: ${task._id}`);
      }
    }
  } catch (error) {
    console.error("Error handling recurring tasks in cron job:", error);
  }
});

app.listen(process.env.PORT || 8000, () =>
  console.log(`Server is running on port ${process.env.PORT || 8000}!`)
);
httpServer.listen(8000);
export const sio = io;
