const si = require('systeminformation');

const getServerStats = async () => {
  try {
    // Fetch server stats using systeminformation
    const [memory, disk, cpu] = await Promise.all([
      si.mem(),
      si.fsSize(),
      si.currentLoad(),
    ]);

    // Calculate percentages
    const memoryPercentage = (memory.active / memory.total) * 100;
    const diskSpacePercentage = (disk[0].used / disk[0].size) * 100;
    console.log("memory: %s, disk: %s, cpu: %s",memoryPercentage, diskSpacePercentage, cpu.currentLoad)

    // Return the server stats with calculated percentages
    return {
      memory: memory.active,
      diskSpace: disk[0].used,
      memoryPercentage,
      diskSpacePercentage,
      cpuLoad: cpu.currentload,
    };
  } catch (error) {
    console.error('Error fetching server stats:', error.message);
    throw error;
  }
};

module.exports = {
  getServerStats,
};
