import createError from "http-errors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import adminRouter from "./routes/admin";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/index", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

// Modified 404 handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource does not exist",
  });
});

// Modified error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  const message = err.message;
  const error = req.app.get("env") === "development" ? err : {};

  // send the error response as JSON
  res.status(err.status || 500).json({
    error: message,
    details: error,
  });
});

export default app;
