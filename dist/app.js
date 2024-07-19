"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
// view engine setup
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "jade");
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/index", index_1.default);
app.use("/users", users_1.default);
app.use("/admin", admin_1.default);
// Modified 404 handler
app.use(function (req, res, next) {
    res.status(404).json({
        error: "Not Found",
        message: "The requested resource does not exist",
    });
});
// Modified error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    const message = err.message;
    const error = req.app.get("env") === "development" ? err : {};
    // send the error response as JSON
    res.status(err.status || 500).json({
        error: message,
        details: error,
    });
});
exports.default = app;
