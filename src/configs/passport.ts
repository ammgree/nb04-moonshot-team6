import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js"; // 값으로 import

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer <token>
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
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"), false);

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

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export default passport;
