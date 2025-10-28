import express from "express";
import passport from "passport";
import { login, refreshToken } from "../controllers/auth.controller.js";
import authService from "../services/auth.service.js";

const router = express.Router();

// 토큰 갱신
router.post("/auth/refresh", refreshToken);

// 로그인 라우터
router.post("/auth/login", login);

// 구글 로그인 시작
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    accessType: "offline", // refresh token 받으려면 필수
    prompt: "consent", // 이미 승인된 사용자도 refresh token 받기 위해
  })
);

// 구글 로그인 콜백
router.get(
  "/auth/google/callback",
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

      res.cookie("refresh-token", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
        path: "/",
      });

      res.cookie("access-token", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 15, // 15분
        path: "/",
      });

      const redirectUrl = new URL("https://nb04-moonshot-team6-front.onrender.com/");

      res.redirect(redirectUrl.toString());
      // ✅ JSON 응답으로 보내기
      // res.status(200).send("cookie test ok");
//       res.send(`
// <html>
//   <body>
//     <h1>로그인 완료!</h1>
//     <p>잠시 후 프론트 페이지로 이동합니다...</p>
//     <script>
//       // 1초 정도 지연 후 프론트 페이지로 이동
//       setTimeout(() => {
//         window.location.href = "https://${frontDomain}/projects";
//       }, 1000);
//     </script>
//   </body>
// </html>
// `);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
