export const access = (right) => {
  return (req, res, next) => {
    if (req.user.role != "assistant") {
      return next();
    } else {
      if (req?.user?.rights?.includes(right)) {
        return next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }
  };
};
