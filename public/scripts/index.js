function kickPlayer(steamid) {
    fetch('/admin-command/kick', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steamId: steamid }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      updatePlayerTable();
    })
    .catch(error => console.error('Error kicking player:', error));
  }
  
  function banPlayer(steamid) {
    fetch('/admin-command/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steamId: steamid }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      updatePlayerTable();
    })
    .catch(error => console.error('Error banning player:', error));
  }
  
  function broadcastMessage() {
    let message = document.getElementById('broadcastMessage').value;
  
    // Replace spaces with thin spaces
    message = message.replace(/ /g, '\u2009');
  
    fetch('/admin-command/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
  
      // Clear the message box
      document.getElementById('broadcastMessage').value = '';
  
      // Display success or failure popup
      if (data.success) {
        alert('Broadcast message sent successfully!');
      } else {
        alert('Error sending broadcast message. Please try again.');
      }
  
      updatePlayerTable();
    })
    .catch(error => {
      console.error('Error broadcasting message:', error);
  
      // Display error popup
      alert('Error sending broadcast message. Please try again.');
    });
  }
  
  function updatePlayerTable() {
    fetch('/get-players-info')
      .then(response => response.json())
      .then(data => {
        const playersTable = document.getElementById('playersTable');
        const onlinePlayerCountElement = document.getElementById('onlinePlayerCount');
        const timerValueElement = document.getElementById('timerValue');
  
        if (data.playersInfoWithoutHeader.trim() !== '') {
          playersTable.querySelector('tbody').innerHTML = '';
          data.playersInfoWithoutHeader.split('\n').forEach(row => {
            const [name, playeruid, steamid] = row.split(',');
            if (steamid && steamid.trim() !== '') {
              const newRow = `<tr>
                <td>${name}</td>
                <td>${playeruid}</td>
                <td>${steamid}</td>
                <td>
                  <button class="btn btn-danger" onclick="kickPlayer('${steamid}')">Kick</button>
                  <button class="btn btn-warning" onclick="banPlayer('${steamid}')">Ban</button>                
                </td>
              </tr>`;
              playersTable.querySelector('tbody').innerHTML += newRow;
            }
          });
  
          onlinePlayerCountElement.innerText = data.playersInfoWithoutHeader.split('\n').length;
        } else {
          playersTable.querySelector('tbody').innerHTML = '';
          onlinePlayerCountElement.innerText = 0;
        }
  
        // Restart the timer
        startTimer();
      })
      .catch(error => console.error('Error updating player table:', error));
  }
  
  function startTimer() {
    let timerValue = 30;
    const timerValueElement = document.getElementById('timerValue');
    timerValueElement.innerText = timerValue;
  
    const countdownInterval = setInterval(() => {
      timerValue--;
      timerValueElement.innerText = timerValue;
      if (timerValue === 0) {
        clearInterval(countdownInterval);
        updatePlayerTable();
      }
    }, 1000);
  }
  
  // Initial start of the timer
  startTimer();
  
  // Bootstrap JS and Popper.js
  const bootstrapScript = document.createElement('script');
  bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
  document.body.appendChild(bootstrapScript);