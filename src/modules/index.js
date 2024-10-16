import messageRouter from "./Message/message.routes.js";
import notiticationRouter from "./Notification/notification.routes.js";
import taskRouter from "./Tasks/tasks.routes.js";
import authRouter from "./auth/auth.routes.js";
import usersRouter from "./users/users.routes.js";
import projectRouter from "./Project/project.routes.js";
import complaintRouter from "./Complaints/complaint.routes.js";
import privacyRouter from "./Privacy/privacy.routes.js";
import docsRouter from "./Documents/docs.routes.js";
import newsRouter from "./News/news.routes.js";
import logRouter from "./Project Log/projectLog.routes.js";
import modelRouter from "./Model/model.routes.js";
import userTypeRouter from "./User Type/userType.routes.js";
import tagsRouter from "./Tags/tags.routes.js";
import teamRouter from "./Team/team.routes.js";
import requestRouter from "./Request/request.routes.js";
import unitsRouter from "./Units/units.routes.js";
import disciplineRouter from "./Discipline/discipline.routes.js";
import actionRouter from "./actionCode/action.routes.js";
import reasonroute from "./reason/reason.routes.js";
import vocationRoute from "./vocation/vocation.routes.js";
import groupChatRouter from "./group Chat/groupChat.routes.js";
import dashboardRouter from "./Dashboard/dashboard.routes.js";
import userGroupRouter from "./User Group/userGroup.routes.js";

export function init(app) {
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/notification", notiticationRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/project", projectRouter);
  app.use("/api/v1/task", taskRouter);
  app.use("/api/v1/complaint", complaintRouter);
  app.use("/api/v1/privacy", privacyRouter);
  app.use("/api/v1/docs", docsRouter);
  app.use("/api/v1/news", newsRouter);
  app.use("/api/v1/log", logRouter);
  app.use("/api/v1/model", modelRouter);
  app.use("/api/v1/type", userTypeRouter);
  app.use("/api/v1/tags", tagsRouter);
  app.use("/api/v1/team", teamRouter);
  app.use("/api/v1/request", requestRouter);
  app.use("/api/v1/units", unitsRouter);
  app.use("/api/v1/discipline", disciplineRouter);
  app.use("/api/v1/action", actionRouter);
  app.use("/api/v1/reason", reasonroute);
  app.use("/api/v1/vocation", vocationRoute);
  app.use("/api/v1/group", groupChatRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/user-group", userGroupRouter);

  app.use("/", (req, res, next) => {
    res.send("Page Not Found");
    // next(res.status(404).json({ message: "Page Not Found" }));
  });

  app.all("*", (req, res, next) => {
    next(res.status(404).json({ message: "Not found" }));
  });
}
