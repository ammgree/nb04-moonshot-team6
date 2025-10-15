import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js"
import { logger } from './utils/logger.js';
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";


import "./configs/passport.js"

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(errorHandler);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate("jwt", { session: false })); 

// ✅ Auth routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
});

export default app;
