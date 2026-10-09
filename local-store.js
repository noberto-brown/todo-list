const fs = require("fs").promises;
const path = require("path");

const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "todo-lists.json");

let writeQueue = Promise.resolve();

async function readLists() {
  try {
    const fileContents = await fs.readFile(dataFile, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    return {};
  }
}

function updateLists(update) {
  writeQueue = writeQueue.then(async () => {
    const lists = await readLists();
    update(lists);
    await fs.mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${dataFile}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(lists, null, 2)}\n`);
    await fs.rename(temporaryFile, dataFile);
  });

  return writeQueue;
}

async function getItems(listKey) {
  const lists = await readLists();
  return lists[listKey] || [];
}

async function getListKeys() {
  const lists = await readLists();
  return Object.keys(lists);
}

async function addItem(listKey, item) {
  await updateLists((lists) => {
    lists[listKey] = lists[listKey] || [];
    lists[listKey].push(item);
  });
}

async function removeItem(listKey, item) {
  await updateLists((lists) => {
    if (lists[listKey]) {
      lists[listKey] = lists[listKey].filter((listItem) => listItem !== item);
    }
  });
}

module.exports = {
  addItem,
  getItems,
  getListKeys,
  removeItem,
};