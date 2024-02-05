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
      // Add logic to handle success or error (e.g., update UI or show a notification)
    })
    .catch(error => console.error('Error starting container:', error));
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
      // Add logic to handle success or error (e.g., update UI or show a notification)
    })
    .catch(error => console.error('Error stopping container:', error));
  }