const Docker = require('dockerode');
const { exec } = require('child_process');
const docker = new Docker();

async function getPalworldContainers() {
  const containers = await docker.listContainers({ all: true });

  // Filter containers that have the "Palworld" image
  const palworldContainers = containers.filter(container =>
    container.Image.toLowerCase().includes('palworld')
  );

  return palworldContainers.map(container => ({
    id: container.Id,
    name: container.Names[0],
  }));
}

async function startContainer(containerId) {
  return new Promise((resolve, reject) => {
    exec(`docker start ${containerId}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function stopContainer(containerId) {
  return new Promise((resolve, reject) => {
    exec(`docker stop ${containerId}`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  getPalworldContainers,
  startContainer,
  stopContainer,
};