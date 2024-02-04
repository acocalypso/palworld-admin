// rcon/rcon.js
const Rcon = require('rcon-client').Rcon;
const dotenv = require('dotenv');

dotenv.config(); // Load configuration variables from .env

const { RCON_HOST, RCON_PORT, RCON_PASSWORD } = process.env;

const rcon = new Rcon({
  host: RCON_HOST,
  port: parseInt(RCON_PORT),
  password: RCON_PASSWORD,
  timeout: 20000, // Adjust timeout as needed
});

const connectRcon = async () => {
  try {
    await rcon.connect();
    console.log('RCON connection established.');
  } catch (error) {
    console.error('Error connecting to RCON:', error.message);
  }
};

const disconnectRcon = async () => {
  try {
    await rcon.disconnect();
    console.log('RCON connection closed.');
  } catch (error) {
    console.error('Error disconnecting from RCON:', error.message);
  }
};

const executeRconCommand = async (command) => {
  try {
    const response = await rcon.send(command);
    console.log(`RCON command "${command}" executed. Response:`, response);
    return response;
  } catch (error) {
    console.error(`Error executing RCON command "${command}":`, error.message);
    throw error;
  }
};

module.exports = {
  connectRcon,
  disconnectRcon,
  executeRconCommand,
};
