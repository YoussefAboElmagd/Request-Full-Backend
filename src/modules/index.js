import messageRouter from "./Message/message.routes.js";
import notiticationRouter from "./Notification/notification.routes.js";
import taskRouter from "./Tasks/tasks.routes.js";
import authRouter from "./auth/auth.routes.js";
import usersRouter from "./users/users.routes.js";
import projectRouter from "./Project/project.routes.js";
import complaintRouter from "./Complaints/complaint.routes.js";


export function init(app) {
  app.use("/users", usersRouter);
  app.use("/auth", authRouter);
  app.use("/notification", notiticationRouter);
  app.use("/message", messageRouter);
  app.use("/project", projectRouter);
  app.use("/task", taskRouter);
  app.use("/complaint", complaintRouter);
  
  app.use("/", (req, res, next) => {
    res.send("Hello World");
  });

  app.all("*", (req, res, next) => {
    next(res.status(404).json({ message: "Not found" }));
  });

}
