document.addEventListener("DOMContentLoaded", function () {
    // Initialize Gauges
    var cpuLoadGauge = new JustGage({
      id: 'cpuLoadGauge',
      value: 0, // Initial value
      min: 0,
      max: 100,
      title: 'CPU Load',
      label: '%',
      levelColorsGradient: true,
    });
  
    var memoryGauge = new JustGage({
      id: 'memoryGauge',
      value: 0, // Initial value
      min: 0,
      max: 100,
      title: 'Memory Free',
      label: '%',
      levelColorsGradient: true,
    });
  
    var diskSpaceGauge = new JustGage({
      id: 'diskSpaceGauge',
      value: 0, // Initial value
      min: 0,
      max: 100,
      title: 'Disk Space Free',
      label: '%',
      levelColorsGradient: true,
    });
  
    // Function to fetch and update stats
    var updateStats = function () {
      fetch('/server-stats/data')
        .then(response => response.json())
        .then(data => {
          // Update gauges with new data
          cpuLoadGauge.refresh(data.cpuLoad || 0);
          memoryGauge.refresh(data.memoryPercentage || 0);
          diskSpaceGauge.refresh(data.diskSpacePercentage || 0);
        })
        .catch(error => console.error('Error fetching server stats:', error));
    };
  
    // Set up refresh timer
    var refreshIntervalSeconds = 60; // Set your desired refresh interval
  
    var refreshTimer = function () {
      var seconds = refreshIntervalSeconds;
      document.getElementById('timer').innerText = ` | Refreshing in ${seconds} seconds`;
  
      var interval = setInterval(function () {
        seconds--;
        document.getElementById('timer').innerText = ` | Refreshing in ${seconds} seconds`;
  
        if (seconds <= 0) {
          clearInterval(interval);
          updateStats();
          refreshTimer();
        }
      }, 1000);
    };
  
    // Add click event listener to the refresh button
    document.getElementById('refreshButton').addEventListener('click', function () {
      updateStats();
      refreshTimer();
    });
  
    // Initial fetch and update after the page has loaded
    updateStats();
    refreshTimer();
  });