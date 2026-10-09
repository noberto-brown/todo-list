require("dotenv").config();
const express = require("express");
const date = require(__dirname + "/dates.js");
const localStore = require(__dirname + "/local-store.js");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public", { dotfiles: 'allow'}));
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const day = date.getDay();
const defaultListKey = "todoList";

async function getAvailableLists() {
  const lists = [{ name: day, key: defaultListKey, href: "/" }];

  (await localStore.getListKeys())
    .filter((key) => key !== defaultListKey)
    .forEach((key) => {
      lists.push({
        name: key,
        key,
        href: `/${encodeURIComponent(key)}`,
      });
    });

  return lists;
}

async function getListPageData(listKey, title, errorMessage) {
  const [newListItems, availableLists] = await Promise.all([
    localStore.getItems(listKey),
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
  const customListName = req.params.customListName;
  res.render(
    "list",
    await getListPageData(customListName, customListName)
  );
});

app.post("/del", async (req, res) => {
  const listName = req.body.listName || defaultListKey;

  await localStore.removeItem(listName, req.body.box);

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
    await localStore.addItem(listName, item);
  }

  if (listName === defaultListKey) {
    return res.redirect("/");
  }

  res.redirect(`/${encodeURIComponent(listName)}`);
});
