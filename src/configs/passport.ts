import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js"; // 값으로 import
import { google } from "googleapis";
import type { Request, Response, NextFunction } from "express";

// // 쿠키에서 access-token 읽기
// const cookieExtractor = (req:Request) => {
//   let token = null;
//   if (req && req.cookies) {
//     token = req.cookies["refresh-token"]; // 쿠키 이름과 일치
//   }
//   return token;
// };

const opts = {
  jwtFromRequest: 
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET!,
};

passport.use(
  "jwt", 
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        console.log("DB에 해당 유저 없음:", payload.userId);
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      console.error("JWT 인증 에러:", err);
      done(err, false);
    }
  })
);

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ["email", "profile", "https://www.googleapis.com/auth/calendar"],
      accessType: "offline",
      prompt: "consent", // 처음 로그인 시 refresh token 발급
    } as any,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email)
          return done(new Error("Google account has no email"), false);

        // 기존 사용자 확인
        let user = await prisma.user.findUnique({ where: { email } });

        // 없으면 새로 등록
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || null,
              googleId: profile.id,
              profileImage: profile.photos?.[0]?.value || null,
            },
          });
        }

        // GoogleToken 저장 또는 업데이트
        const googleToken = await prisma.googleToken.upsert({
          where: { userId: user.id },
          update: { accessToken, refreshToken, updatedAt: new Date() },
          create: { userId: user.id, accessToken, refreshToken },
        });

        const oAuth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        oAuth2Client.setCredentials({
          access_token: googleToken.accessToken,
          refresh_token: googleToken.refreshToken ?? null, // undefined이면 null로
        });

        // req.user에 tokens 포함시키기 위해 확장
        const userWithTokens = {
          ...user,
          tokens: googleToken,
        };

        done(null, userWithTokens);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export default passport;
