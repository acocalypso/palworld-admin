function startContainer(containerId) {
  console.log('Starting container:', containerId);
  
  fetch(`/server-control/start/${containerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      alert('Container started successfully');
    })
    .catch(error => {
      console.error('Error starting container:', error);
      alert('Error starting container. Please try again.');
    });
}

function stopContainer(containerId) {
  console.log('Stopping container:', containerId);
  
  fetch(`/server-control/stop/${containerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ containerId })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      alert('Container stopped successfully');
    })
    .catch(error => {
      console.error('Error stopping container:', error);
      alert('Error stopping container. Please try again.');
    });
}
