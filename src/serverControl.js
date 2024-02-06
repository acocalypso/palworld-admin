const Docker = require('dockerode');
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
    docker.getContainer(containerId).start((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true });
      }
    });
  });
}

async function stopContainer(containerId) {
  return new Promise((resolve, reject) => {
    docker.getContainer(containerId).stop((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ success: true });
      }
    });
  });
}

module.exports = {
  getPalworldContainers,
  startContainer,
  stopContainer,
};