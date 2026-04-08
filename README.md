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

- `BEEBOLE_API_TOKEN`: Your API token (found in **Beebole > Settings > Account**).

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

In your Gemini CLI workspace, you can add it to your tools:

```bash
# Example local configuration or via environment variables
export BEEBOLE_API_TOKEN=your_token_here
```

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

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
