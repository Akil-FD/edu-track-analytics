"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', articleController_1.getArticles);
router.get('/:id', articleController_1.getArticle);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.TEACHER), errorHandler_1.upload.array('files', 10), articleController_1.createArticle);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.TEACHER), errorHandler_1.upload.array('files', 10), articleController_1.updateArticle);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.TEACHER), articleController_1.deleteArticle);
exports.default = router;
//# sourceMappingURL=articles.js.map