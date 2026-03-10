"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', (0, auth_1.authorize)(types_1.UserRole.TEACHER), analyticsController_1.getTeacherAnalytics);
router.get('/student', (0, auth_1.authorize)(types_1.UserRole.STUDENT), analyticsController_1.getStudentAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map