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
  try {
    await new Promise((resolve, reject) => {
      docker.getContainer(containerId).start((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
    return { success: true };
  } catch (error) {
    console.error('Error starting container:', error);
    return { success: false, message: error.message };
  }
}

async function stopContainer(containerId) {
  try {
    await new Promise((resolve, reject) => {
      docker.getContainer(containerId).stop((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
    return { success: true };
  } catch (error) {
    console.error('Error stopping container:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  getPalworldContainers,
  startContainer,
  stopContainer,
};
