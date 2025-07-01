export const globalError = (err, req, res, next) => {
  if (process.env.MODE == "dev") {
    res.json({ err: err.message});
  } else {
    res.json({ err: err.message });
  }
};
