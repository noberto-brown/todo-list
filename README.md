# ToDoList

A simple Express and EJS to-do list application backed by a local JSON file while the UI is being developed. The app provides a default daily list and supports additional custom lists through the URL.

## Requirements

- Node.js 18 or newer

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ToDoList
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Start the application:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Add a task by entering it in the input field and selecting `+`.
- Mark a task as complete by selecting its checkbox. This removes it from the list.
- Open the menu button beside the list title to navigate between persisted lists.
- Select `New list` in the menu, enter a name, and select `Create list` to open it.
- A new empty list is not persisted until its first task is added. List names are preserved and safely URL-encoded when navigating.
- Tasks are stored in `data/todo-lists.json`, so they persist across application restarts without making Upstash requests.

## Available Commands

```bash
npm start    # Start the app
npm run dev  # Start the app with Node watch mode
npm test     # Placeholder script; automated tests are not currently configured
```

## Project Structure

```text
app.js                  Express server and routes
local-store.js          Local JSON persistence adapter
data/                   Local todo data used during UI development
dates.js                Date helper functions
public/                 CSS and client-side JavaScript
views/                  EJS templates
package.json            Dependencies and npm scripts
```

