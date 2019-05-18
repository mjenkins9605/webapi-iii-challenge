const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const usersRouter = require("./users/userRouter.js");
const server = express();

server.use(express.json());
server.use(helmet());
server.use(logger("dev"));
server.use(typeLogger);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

//custom middleware

function typeLogger(req, res, next) {
  console.log(
    `Request Type: ${req.method}, Request URL: ${
      req.url
    }, Timestamp: ${Date()} `
  );
  next();
}

module.exports = server;
