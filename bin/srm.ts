#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import tsNode from 'ts-node';
import { deploy } from '../src/deploy';

// Register ts-node to handle TypeScript files
tsNode.register({
  compilerOptions: {
    module: 'commonjs',
  },
});

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'deploy') {
    const configPath = args[1] || 'srm.config.ts';
    const envFilePath = args[2] || '.env';
    
    console.log(`Config path: ${configPath}`);
    console.log(`Env file path: ${envFilePath}`);

    // Check if the config file exists
    if (!fs.existsSync(configPath)) {
      console.error(`Configuration file not found: ${configPath}`);
      process.exit(1);
    }

    // Check if the .env file exists
    if (!fs.existsSync(envFilePath)) {
      console.warn(`Warning: Environment file not found: ${envFilePath}`);
      console.warn('Proceeding without environment variables. Make sure STRIPE_SECRET_KEY is set.');
    }

    try {
      await deploy(configPath, envFilePath);
    } catch (error) {
      console.error('Error during deployment:', error);
      process.exit(1);
    }
  } else {
    console.error('Unknown command. Use "srm deploy [path-to-config] [path-to-env-file]"');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error executing SRM command:', error);
  process.exit(1);
});