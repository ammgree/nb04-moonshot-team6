import express from "express";
import passport from "passport";
import {
  login,
  refreshToken,
} from "../controllers/auth.controller.js";
import authService from "../services/auth.service.js";

const router = express.Router();

// 토큰 갱신
router.post("/refresh", refreshToken);

// 로그인 라우터
router.post("/login", login);

// 구글 로그인 시작
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }
  )
);

// 구글 로그인 콜백
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    try {
      if (!req.user?.email || !req.user?.googleId) {
        return res.status(400).json({ message: "Invalid Google profile data" });
      }

      const profile: {
        email: string;
        googleId: string;
        name?: string;
        picture?: string;
      } = {
        email: req.user.email,
        googleId: req.user.googleId,
        ...(req.user.name ? { name: req.user.name } : {}),
        ...(req.user.profileImage ? { picture: req.user.profileImage } : {}),
      };

      const meta: { ip?: string; device?: string } = {
        ...(req.ip ? { ip: req.ip } : {}),
        ...(req.headers["user-agent"]
          ? { device: req.headers["user-agent"] }
          : {}),
      };

      const result = await authService.signInWithGoogle(profile, meta);

      res.cookie("access-token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
        path: "/",
      });

      res.cookie("refresh-token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
        path: "/",
      });

      const redirectUrl = new URL("http://localhost:3000/");

      res.redirect(redirectUrl.toString());

    } catch (err) {
      next(err);
    }
  }
);

export default router;
