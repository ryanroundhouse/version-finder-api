# Release Management API

This project is a Node.js Express application that manages release information for various projects.

## Features

- Retrieve release information for specific projects
- Get dependency information for releases
- Add dependencies to releases

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

The server will run on `http://localhost:3000`.

## API Endpoints

### Get Releases for a Project

- **GET** `/releases/:projectId`

Sample request:

```
curl http://localhost:3000/releases/project1
```

Sample response:

```json
[
  {
    "id": "10676",
    "name": "6.7.9",
    "description": "Patch release.",
    "startDate": "2025-10-29",
    "releaseDate": "2025-12-23"
  },
  {
    "id": "10675",
    "name": "6.7.8",
    "description": "Patch release.",
    "startDate": "2025-09-03",
    "releaseDate": "2025-10-28"
  }
  // ... more releases
]
```

### Get Dependencies for a Project

- **GET** `/dependencies/:projectId`

Sample request:

```
GET http://localhost:3000/dependencies/cis
```

Sample response:

```json
{
  "10676": [
    {
      "project": "cc",
      "release": "2.3.0",
      "dependencyReleaseId": "559"
    },
    {
      "project": "blr",
      "release": "1.5.2",
      "dependencyReleaseId": "234"
    }
  ],
  "10675": [
    {
      "project": "cc",
      "release": "2.2.1",
      "dependencyReleaseId": "105"
    }
  ]
}
```

### Set Dependencies for a Release

Sets the dependencies for a specific release of a project.

- **URL:** `/dependencies/:projectId/:releaseId`
- **Method:** `POST`
- **URL Params:**
  - `projectId`: ID of the project
  - `releaseId`: ID of the release
- **Data Params:**
  ```json
  {
    "dependencies": [
      {
        "dependencyReleaseId": "string",
        "project": "string",
        "release": "string"
      },
      ...
    ]
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "Dependencies set successfully",
      "release": {
        // Release object
      },
      "dependencies": [
        {
          "dependencyReleaseId": "string",
          "project": "string",
          "release": "string"
        },
        ...
      ]
    }
    ```
- **Error Responses:**
  - **Code:** 400 BAD REQUEST
    - **Content:** `{ "error": "Invalid project ID" }` or `{ "error": "Invalid request body. Each dependency must include releaseId, project, and release." }`
  - **Code:** 404 NOT FOUND
    - **Content:** `{ "error": "Release not found" }`
  - **Code:** 500 INTERNAL SERVER ERROR
    - **Content:** `{ "error": "Internal server error" }`

**Note:** Each dependency in the array must include `releaseId`, `project`, and `release` properties.

## Project Structure

- `server.js`: Main application file
- `releases/`: Directory containing JSON files with release information
- `dependencies/`: Directory containing JSON files with dependency information

## Configuration

Project IDs are mapped to their respective JSON files in the `projectMap` object within `server.js`.

## Error Handling

The API includes basic error handling for file reading, JSON parsing, and invalid project IDs.
