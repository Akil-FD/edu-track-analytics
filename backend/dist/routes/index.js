"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightRouter = exports.trackingRouter = void 0;
const express_1 = require("express");
const trackingController_1 = require("../controllers/trackingController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const highlights_1 = require("./highlights");
Object.defineProperty(exports, "highlightRouter", { enumerable: true, get: function () { return highlights_1.highlightRouter; } });
exports.trackingRouter = (0, express_1.Router)();
exports.trackingRouter.use(auth_1.protect, (0, auth_1.authorize)(types_1.UserRole.STUDENT));
exports.trackingRouter.post('/', trackingController_1.logTracking);
//# sourceMappingURL=index.js.map