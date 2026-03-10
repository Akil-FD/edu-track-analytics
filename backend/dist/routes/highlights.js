"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const highlightsController_1 = require("../controllers/highlightsController");
exports.highlightRouter = (0, express_1.Router)();
exports.highlightRouter.use(auth_1.protect, (0, auth_1.authorize)(types_1.UserRole.STUDENT));
exports.highlightRouter.get('/', highlightsController_1.getAllHighlights);
exports.highlightRouter.get('/:articleId', highlightsController_1.getHighlightsByArticle);
exports.highlightRouter.post('/', highlightsController_1.createHighlight);
exports.highlightRouter.delete('/:id', highlightsController_1.deleteHighlight);
//# sourceMappingURL=highlights.js.map