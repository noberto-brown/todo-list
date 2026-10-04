require("dotenv").config();
const express = require("express");
// const redis = require("redis");
const Redis = require("@upstash/redis").Redis;
const date = require(__dirname + "/dates.js");
const _ = require("lodash");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public", { dotfiles: 'allow'}));
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// const client = redis.createClient({ url: "redis://@localhost:6379/1" });
const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

let day = date.getDay();

app.get("/", async (_, res) => {
  const result = await client.lrange("todoList", 0, -1);

  if (result.length === 0) {
    res.render("list", { title: day, newListItems: Array.apply(null) });
  } else {
    res.render("list", { title: day, newListItems: result });
  }
});

app.get("/:customListName", async (req, res) => {
  return res.render("list", { title: req.params.customListName, newListItems: [] });
  const customListName = _.capitalize(req.params.customListName);
  const itExists = await client.exists(customListName);

  if (itExists) {
    const List = await client.lrange(customListName, 0, -1);
    res.render("list", { title: customListName, newListItems: List });
  } else {
    res.render("list", {
      title: customListName,
      newListItems: Array.apply(null),
    });
  }
});

app.post("/del", async (req, res) => {
  const listName = req.body.listName;

  if (listName === day) {
    client.lrem("todoList", 0, req.body.box);
    res.redirect("/");
  } else {
    client.lrem(listName, 0, req.body.box);
    res.redirect("/" + listName);
  }
});

app.post("/", (req, res) => {
  if (req.body.button === day) {
    const item = req.body.newItem;

    client.rpush("todoList", item);

    res.redirect("/");
  } else {
    const item = req.body.newItem;

    client.rpush(req.body.button, item);

    res.redirect("/" + req.body.button);
  }
});
