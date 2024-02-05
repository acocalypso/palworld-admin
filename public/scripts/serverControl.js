function startContainer(containerId) {
  fetch(`/server-control/start/${containerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Display success or failure alert
      if (data.success) {
        alert('Container started successfully');
      } else {
        alert('Error starting container. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error starting container:', error);

      // Display error alert for fetch error
      alert('Error starting container. Please try again.');
    });
}

function stopContainer(containerId) {
  fetch(`/server-control/stop/${containerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Display success or failure alert
      if (data.success) {
        alert('Container stopped successfully');
      } else {
        alert('Error stopping container. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error stopping container:', error);

      // Display error alert for fetch error
      alert('Error stopping container. Please try again.');
    });
}