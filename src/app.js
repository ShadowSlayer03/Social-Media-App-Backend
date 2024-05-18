import cookieParser from 'cookie-parser';
import express from 'express'
import cors from 'cors'

import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import healthcheckRouter from './routes/healthcheck.routes.js';
import tweetRouter from './routes/tweets.routes.js';
import playListRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import likesRouter from "./routes/likes.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

let app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: "100kb"
}));  //Middleware to make sure that req.body is passed as json
app.use(express.urlencoded({ extended: true }));
app.use(express.static("/public"));
app.use(cookieParser());  // Adding cookie parser as middleware so that res.cookie and req.cookie can be set



app.use("/api/v1/users",userRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/healthcheck",healthcheckRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/playlists",playListRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/likes",likesRouter);
app.use("/api/v1/dashboard",dashboardRouter);

export {app}

