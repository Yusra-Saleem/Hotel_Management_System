const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Execute the command passed as arguments
const command = process.argv.slice(2).join(' ');
if (command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    process.exit(error.status);
  }
} else {
  console.error('No command provided to load-env.js');
  process.exit(1);
}
