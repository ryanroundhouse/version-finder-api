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

app.use(express.json());

app.get('/releases/:projectId', (req, res) => {
  const projectId = req.params.projectId.toLowerCase();
  const fileName = projectMap[projectId];

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const filePath = path.join(__dirname, 'releases', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      const releases = JSON.parse(data);
      res.json(releases);
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.get('/dependencies/:projectId', (req, res) => {
  const projectId = req.params.projectId.toLowerCase();
  const fileName = `${projectId}_dependencies.json`;
  const filePath = path.join(__dirname, 'dependencies', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // If the file doesn't exist, return an empty object
        return res.json({});
      }
      console.error(`Error reading dependencies file: ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      const dependencies = JSON.parse(data);
      res.json(dependencies);
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.post('/dependencies/:projectId/:releaseId', (req, res) => {
  const projectId = req.params.projectId.toLowerCase();
  const releaseId = req.params.releaseId;
  const fileName = projectMap[projectId];

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { dependencies } = req.body;

  if (!dependencies || !Array.isArray(dependencies)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const releasesFilePath = path.join(__dirname, 'releases', fileName);
  const dependenciesFilePath = path.join(__dirname, 'dependencies', `${projectId}_dependencies.json`);

  fs.readFile(releasesFilePath, 'utf8', (err, releasesData) => {
    if (err) {
      console.error(`Error reading releases file: ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      const releases = JSON.parse(releasesData);
      const targetRelease = releases.find(r => r.id === releaseId);

      if (!targetRelease) {
        return res.status(404).json({ error: 'Release not found' });
      }

      fs.readFile(dependenciesFilePath, 'utf8', (depErr, depData) => {
        let dependenciesObj = {};
        if (!depErr) {
          dependenciesObj = JSON.parse(depData);
        }

        if (!dependenciesObj[releaseId]) {
          dependenciesObj[releaseId] = [];
        }

        dependencies.forEach(dep => {
          if (!dependenciesObj[releaseId].some(d => d.project === dep.project && d.release === dep.release)) {
            dependenciesObj[releaseId].push(dep);
          }
        });

        fs.writeFile(dependenciesFilePath, JSON.stringify(dependenciesObj, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            console.error(`Error writing dependencies file: ${writeErr}`);
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.json({ message: 'Dependencies added successfully', release: targetRelease, dependencies: dependenciesObj[releaseId] });
        });
      });
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});