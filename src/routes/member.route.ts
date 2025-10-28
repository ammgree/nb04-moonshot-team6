import express from "express";
import passport from "../configs/passport.js";
import * as memberController from "../controllers/member.controller.js";

const router = express.Router();
router
  .get(
    "/projects/:projectId/users",
    passport.authenticate("jwt", { session: false }),
    memberController.getMembers
  )
  .delete(
    "/projects/:projectId/users/:userId",
    passport.authenticate("jwt", { session: false }),
    memberController.deleteMember
  )
  .post(
    "/projects/:projectId/invitations",
    passport.authenticate("jwt", { session: false }),
    memberController.inviteMember
  )
  .post("/invitations/:invitationId/accept", memberController.acceptInvitation)
  .delete(
    "/invitations/:invitationId",
    passport.authenticate("jwt", { session: false }),
    memberController.cancelInvitation
  );

export default router;
