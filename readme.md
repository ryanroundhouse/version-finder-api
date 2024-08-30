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
      "release": "2.3.0"
    },
    {
      "project": "blr",
      "release": "1.5.2"
    }
  ],
  "10675": [
    {
      "project": "cc",
      "release": "2.2.1"
    }
  ]
}
```

### Add Dependencies to a Release

- **POST** `/dependencies/:projectId/:releaseId`

Sample request:

```
POST http://localhost:3000/dependencies/cis/10676
Content-Type: application/json
{
  "dependencies": [
    {
      "project": "cc",
      "release": "2.3.1"
    },
    {
      "project": "pubs",
      "release": "1.0.0"
    }
  ]
}
```

sample response:

```json
{
  "message": "Dependencies added successfully",
  "release": {
    "id": "10676",
    "name": "6.7.9",
    "description": "Patch release.",
    "startDate": "2025-10-29",
    "releaseDate": "2025-12-23"
  },
  "dependencies": [
    {
      "project": "cc",
      "release": "2.3.0"
    },
    {
      "project": "blr",
      "release": "1.5.2"
    },
    {
      "project": "cc",
      "release": "2.3.1"
    },
    {
      "project": "pubs",
      "release": "1.0.0"
    }
  ]
}
```

## Project Structure

- `server.js`: Main application file
- `releases/`: Directory containing JSON files with release information
- `dependencies/`: Directory containing JSON files with dependency information

## Configuration

Project IDs are mapped to their respective JSON files in the `projectMap` object within `server.js`.

## Error Handling

The API includes basic error handling for file reading, JSON parsing, and invalid project IDs.
