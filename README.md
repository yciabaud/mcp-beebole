# MCP Beebole

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This **Model Context Protocol (MCP)** server allows AI assistants to interact with the **Beebole** REST API for time tracking management.

## Purpose
Enable an AI assistant to list your active projects, view your time entries, and log work hours or absences.

## Technical Stack
- Node.js (TypeScript)
- `@modelcontextprotocol/sdk`
- `axios` for HTTP requests.
- `zod` for schema validation.

## Installation

1.  Clone this repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```

## Configuration (Environment Variables)
Authentication relies on a personal Beebole API token.

- `BEEBOLE_API_TOKEN`: Your API token that you can retrieve from Beebole using the API Token module on your home screen.

---

## Usage with Claude Desktop

Add the following configuration to your `claude_desktop_config.json` file (typically located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "beebole": {
      "command": "node",
      "args": ["/path/to/mcp-beebole/build/index.js"],
      "env": {
        "BEEBOLE_API_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

## Usage with Gemini CLI

You can add this server to your Gemini CLI workspace using the following command:

```bash
gemini mcp add beebole node /path/to/mcp-beebole/build/index.js -e BEEBOLE_API_TOKEN=$BEEBOLE_API_TOKEN
```

Alternatively, you can manually add it to your `~/.gemini/settings.json` (global) or `.gemini/settings.json` (project-specific) file:

```json
{
  "mcpServers": {
    "beebole": {
      "command": "node",
      "args": ["/path/to/mcp-beebole/build/index.js"],
      "env": {
        "BEEBOLE_API_TOKEN": "$BEEBOLE_API_TOKEN"
      }
    }
  }
}
```

> **Note:** Gemini CLI automatically expands environment variables starting with `$`. Make sure `BEEBOLE_API_TOKEN` is set in your shell or replace it with your actual token.

---

## Usage Examples

Here are some ways you can interact with Beebole through your AI assistant:

### 1. Discovering your projects
**Prompt:** "What are my active projects in Beebole?"  
**Assistant Action:** Calls `list_my_projects`.  
**Result:** Displays a list of projects, subprojects, and tasks with their respective IDs.

### 2. Logging time
**Prompt:** "Log 7.5 hours on the 'Development' project for today with the comment 'Working on the MCP server'."  
**Assistant Action:** 
1. Calls `list_my_projects` to find the ID for "Development".
2. Calls `create_time_entry` with today's date, the resolved project ID, `7.5` hours, and the provided comment.  
**Result:** Confirmation that the entry was created or updated in Beebole.

### 3. Checking your timesheet
**Prompt:** "Show me my time entries for this week."  
**Assistant Action:** Calculates the dates for the current week and calls `get_time_entries`.  
**Result:** A summary table of all hours logged for each day of the week.

---

## Exposed Tools

1.  **`list_my_projects`**
    - Description: Returns a list of the user's active projects and tasks.
2.  **`create_time_entry`**
    - Parameters:
        - `date`: Date (format `YYYY-MM-DD`).
        - `project_id`: ID of the project or task.
        - `hours`: Number of hours (numeric).
        - `comment`: (Optional) Comment.
    - Description: Creates a new time entry.
3.  **`get_time_entries`**
    - Parameters:
        - `start_date`: Start date (`YYYY-MM-DD`).
        - `end_date`: End date (`YYYY-MM-DD`).
    - Description: Lists existing time entries for the given period.

## Testing
The project uses `vitest` for unit tests:
```bash
npm test
```

## Troubleshooting

### 401 Unauthorized
Ensure your `BEEBOLE_API_TOKEN` is correct. You can find it in **Beebole > Settings > Account**.

### Project/Task not found
If the assistant cannot find a project, try calling `list_my_projects` first. Only active projects and tasks are returned by the API.

### Connection issues in Claude Desktop
- Check the logs in Claude Desktop (often located in `~/Library/Logs/Claude/mcp.log` on macOS).
- Ensure `node` is in your system PATH and accessible by the Claude app.
- Make sure you ran `npm run build` to generate the `build/` folder.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
