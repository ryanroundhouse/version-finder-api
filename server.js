const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

// Map Jira project IDs to their respective JSON file names
const projectMap = {
  cis: 'cis_releases.json',
  cc: 'cc_releases.json',
  blr: 'blr_releases.json',
  csr: 'csr_releases.json',
  mc: 'mc_releases.json',
  nsbl: 'nsbl_releases.json',
  pubs: 'pubs_releases.json'
};
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.get('/releases/:projectId', (req, res) => {
  console.log(`Received GET request for releases of project: ${req.params.projectId}`);
  const projectId = req.params.projectId.toLowerCase();
  const fileName = projectMap[projectId];

  if (!fileName) {
    console.log(`Invalid project ID: ${projectId}`);
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const filePath = path.join(__dirname, 'releases', fileName);
  console.log(`Reading file: ${filePath}`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      const releases = JSON.parse(data);
      console.log(`Successfully retrieved releases for project: ${projectId}`);
      res.json(releases);
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.get('/dependencies/:projectId', (req, res) => {
  console.log(`Received GET request for dependencies of project: ${req.params.projectId}`);
  const projectId = req.params.projectId.toLowerCase();
  const fileName = `${projectId}_dependencies.json`;
  const filePath = path.join(__dirname, 'dependencies', fileName);

  console.log(`Reading dependencies file: ${filePath}`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`Dependencies file not found for project: ${projectId}. Returning empty object.`);
        return res.json({});
      }
      console.error(`Error reading dependencies file: ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      const dependencies = JSON.parse(data);
      console.log(`Successfully retrieved dependencies for project: ${projectId}`);
      res.json(dependencies);
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.post('/dependencies/:projectId/:releaseId', (req, res) => {
  console.log(`Received POST request to set dependencies for project: ${req.params.projectId}, release: ${req.params.releaseId}`);
  const projectId = req.params.projectId.toLowerCase();
  const releaseId = req.params.releaseId;
  const fileName = projectMap[projectId];

  if (!fileName) {
    console.log(`Invalid project ID: ${projectId}`);
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { dependencies } = req.body;

  if (!dependencies || !Array.isArray(dependencies) || dependencies.some(dep => !dep.dependencyReleaseId || !dep.project || !dep.version)) {
    console.log(`Invalid request body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'Invalid request body. Each dependency must include dependencyReleaseId, project, and version.' });
  }

  const releasesFilePath = path.join(__dirname, 'releases', fileName);
  const dependenciesDir = path.join(__dirname, 'dependencies');
  const dependenciesFilePath = path.join(dependenciesDir, `${projectId}_dependencies.json`);

  console.log(`Ensuring dependencies directory exists: ${dependenciesDir}`);
  fs.mkdir(dependenciesDir, { recursive: true }, (mkdirErr) => {
    if (mkdirErr) {
      console.error(`Error creating dependencies directory: ${mkdirErr}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log(`Reading releases file: ${releasesFilePath}`);
    fs.readFile(releasesFilePath, 'utf8', (err, releasesData) => {
      if (err) {
        console.error(`Error reading releases file: ${err}`);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        const releases = JSON.parse(releasesData);
        const targetRelease = releases.find(r => r.id === releaseId);

        if (!targetRelease) {
          console.log(`Release not found: ${releaseId}`);
          return res.status(404).json({ error: 'Release not found' });
        }

        console.log(`Reading dependencies file: ${dependenciesFilePath}`);
        fs.readFile(dependenciesFilePath, 'utf8', (depErr, depData) => {
          let dependenciesObj = {};
          if (!depErr) {
            dependenciesObj = JSON.parse(depData);
          }

          // Set the dependencies for the given release ID
          dependenciesObj[releaseId] = dependencies;

          console.log(`Writing updated dependencies to file: ${dependenciesFilePath}`);
          fs.writeFile(dependenciesFilePath, JSON.stringify(dependenciesObj, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
              console.error(`Error writing dependencies file: ${writeErr}`);
              return res.status(500).json({ error: 'Internal server error' });
            }
            console.log(`Dependencies set successfully for project: ${projectId}, release: ${releaseId}`);
            res.json({ message: 'Dependencies set successfully', release: targetRelease, dependencies: dependenciesObj[releaseId] });
          });
        });
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});