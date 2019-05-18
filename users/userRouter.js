const express = require("express");

const router = express.Router();

const userDb = require("./userDb");
const postDb = require("../posts/postDb.js");

router.post("/", (req, res) => {
  const post = req.body;
  userDb
    .insert(post)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      res.status(500).json({
        error: err,
        message: "There was an error while saving the post to the database"
      });
    });
});

router.post("/:id/posts", validatePost, async (req, res) => {
  const { id } = req.params;
  const newPost = { ...req.body, user_id: id };
  try {
    const post = await postDb.insert(newPost);
    res.status(200).json(post);
  } catch (err) {
    next({ message: "Error with post" });
  }
});

router.get('/', async (req, res) => {
    try {
        const users = await userDb.get(req.query);
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Error retriving the Users'})
    }
});

router.get("/:id", validateUserId, (req, res) => {
  const { id } = req.params;
  userDb
    .getById(id)
    .then(post => {
      if (post === 0) {
        return res(404).json({
          message: "The user you're looking for cannot be found."
        });
      }
      res.json(post);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err, message: "User could not be retrieved." });
    });
});

router.get("/:id/posts", validatePost, async (req, res) => {
  try {
    const user = await userDb.getUserPosts(req.body);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ message: "missing post data" });
    }
  } catch (err) {
    next({ message: "missing required text field" });
  }
});

router.delete("/:id", validateUserId, async (req, res) => {
  const removedUser = await userDb.remove(req.params.id);
  res.status(200).json(removedUser);
});

router.put("/:id", validateUserId, validateUser, async (req, res) => {
  try {
    const user = await userDb.update(req.params.id, req.body);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "The user could not be found" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error updating the user"
    });
  }
});

//custom middleware

async function validateUserId(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userDb.getById(id);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to process request" });
  }
}

function validateUser(req, res, next) {
  if (req.body.name && Object.keys(req.body.name).length) {
    console.log(Object.keys(req.body).length);
    next();
  } else {
    res.status(400).json({ message: "Missing required name field" });
  }
}

function validatePost(req, res, next) {
  if (req.body && Object.keys(req.body).length) {
    if (req.body.name && Object.keys(req.body.name).length) {
      next();
    } else {
      res.status(400).json({ message: "Missing required text field" });
    }
  } else {
    res.status(400).json({ message: "Missing post data" });
  }
}

module.exports = router;
