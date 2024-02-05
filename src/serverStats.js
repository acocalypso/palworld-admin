const si = require('systeminformation');

const getServerStats = async () => {
  try {
    // Fetch server stats using systeminformation
    const [memory, disk] = await Promise.all([
      si.mem(),
      si.fsSize(),
    ]);

    const cpuLoad = await si.currentLoad();

    // Calculate percentages
    const memoryPercentage = (memory.active / memory.total) * 100;
    const diskSpacePercentage = ((disk[0].size - disk[0].used) / disk[0].size) * 100;

    // Return the server stats with calculated percentages
    return {
      memoryPercentage,
      diskSpacePercentage,
      cpuLoad: cpuLoad.currentLoad,
    };
  } catch (error) {
    console.error('Error fetching server stats:', error.message);
    throw error;
  }
};

module.exports = {
  getServerStats,
};
