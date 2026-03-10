import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { UserRole } from "../types";
import { createHighlight, deleteHighlight, getAllHighlights, getHighlightsByArticle } from "../controllers/highlightsController";

export const highlightRouter = Router();
highlightRouter.use(protect, authorize(UserRole.STUDENT));
highlightRouter.get('/', getAllHighlights);
highlightRouter.get('/:articleId', getHighlightsByArticle);
highlightRouter.post('/', createHighlight);
highlightRouter.delete('/:id', deleteHighlight);
