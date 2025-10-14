import express from "express";
import * as memberController from "../controllers/member.controller.js";

const router = express.Router();
router
  .get("/projects/:projectId/users", memberController.getMembers)
  .delete("/projects/:projectId/users/:userId", memberController.deleteMember)
  .post("/projects/:projectId/invitations", memberController.inviteMember)
  .post("/invitations/:invitationId/accept", memberController.acceptInvitation)
  .delete("/invitations/:invitationId", memberController.deleteInvitation);

export default router;
