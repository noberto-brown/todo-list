require("dotenv").config();
const express = require("express");
// const redis = require("redis");
const Redis = require("@upstash/redis").Redis;
const date = require(__dirname + "/dates.js");
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

const day = date.getDay();
const defaultListKey = "todoList";

async function getAvailableLists() {
  const lists = [{ name: day, key: defaultListKey, href: "/" }];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await client.scan(cursor, {
      count: 100,
      type: "list",
    });

    cursor = String(nextCursor);
    keys
      .filter((key) => key !== defaultListKey)
      .forEach((key) => {
        lists.push({
          name: key,
          key,
          href: `/${encodeURIComponent(key)}`,
        });
      });
  } while (cursor !== "0");

  return lists;
}

async function getListPageData(listKey, title, errorMessage) {
  const [newListItems, availableLists] = await Promise.all([
    client.lrange(listKey, 0, -1),
    getAvailableLists(),
  ]);

  return {
    title,
    listKey,
    newListItems,
    availableLists,
    errorMessage,
  };
}

app.get("/", async (_, res) => {
  return res.render("list", {
    title: "list",
    newListItems: [],
  });
  res.render("list", await getListPageData(defaultListKey, day));
});

app.post("/lists", async (req, res) => {
  const listName = req.body.listName?.trim();

  if (!listName || listName.length > 60) {
    const pageData = await getListPageData(
      defaultListKey,
      day,
      "List names must contain between 1 and 60 characters."
    );
    return res.status(400).render("list", pageData);
  }

  res.redirect(`/${encodeURIComponent(listName)}`);
});

app.get("/:customListName", async (req, res) => {
  return res.render("list", {
    title: "list",
    newListItems: [],
  });
  const customListName = req.params.customListName;
  res.render(
    "list",
    await getListPageData(customListName, customListName)
  );
});

app.post("/del", async (req, res) => {
  const listName = req.body.listName || defaultListKey;

  await client.lrem(listName, 0, req.body.box);

  if (listName === defaultListKey) {
    return res.redirect("/");
  } else {
    return res.redirect(`/${encodeURIComponent(listName)}`);
  }
});

app.post("/", async (req, res) => {
  const item = req.body.newItem?.trim();
  const listName = req.body.listName || defaultListKey;

  if (item) {
    await client.rpush(listName, item);
  }

  if (listName === defaultListKey) {
    return res.redirect("/");
  }

  res.redirect(`/${encodeURIComponent(listName)}`);
});
