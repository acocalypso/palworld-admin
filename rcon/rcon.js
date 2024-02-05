const { Rcon } = require('minecraft-rcon-client');
const dotenv = require('dotenv');

dotenv.config(); // Load configuration variables from .env
const { RCON_PORT, RCON_PASSWORD, RCON_HOST } = process.env;

const client = new Rcon({
  port: parseInt(RCON_PORT),
  host: RCON_HOST,
  password: RCON_PASSWORD,
});

const executeRconCommand = async (command) => {
  try {
    // Connect to the server
    await client.connect();

    // Send the command and wait for the response
    const response = await client.send(command);

    // Disconnect from the server
    await client.disconnect();

    return response; // Return the response
  } catch (error) {
    console.error(`Error executing RCON command "${command}":`, error.message);
    throw error;
  }
};

module.exports = {
  executeRconCommand,
};
