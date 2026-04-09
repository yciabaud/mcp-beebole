# Beebole Extension for Gemini CLI

This extension integrates Beebole time tracking into Gemini CLI using the Model Context Protocol (MCP).

## Capabilities

- **Time Tracking**: Log hours on projects, subprojects, and tasks.
- **Absence Management**: Log hours for absences like Vacation or Sick Leave.
- **Project Discovery**: List the hierarchical structure of projects, subprojects, and tasks.
- **Time Reporting**: Retrieve and summarize your time entries for any given period.

## Usage

You can interact directly with the Beebole tools or use the `@beebole` subagent for a more conversational experience.

### Examples

- "@beebole list my projects for today"
- "@beebole I spent 4 hours on the development task for project X today"
- "@beebole how many hours did I log last week?"
- "@beebole I'm taking tomorrow off as Vacation"

## Configuration

The extension requires a `BEEBOLE_API_TOKEN`. You can set this in your environment or through the Gemini CLI settings.
You can find your API token in Beebole using the **API Token** module on your home screen.
