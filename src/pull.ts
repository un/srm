import { fetchProducts, generateConfigString } from './get-stripe-products';
import dotenv from 'dotenv';
import fs from 'fs';

export async function pull(
  configPath: string = 'srm.config.ts',
  envFilePath: string = '.env'
): Promise<void> {
  console.error('Starting pull process...'); // Use console.error for logging

  // Check if the .env file exists before loading
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.error('Environment variables loaded from:', envFilePath);
  } else {
    console.error(`Environment file not found: ${envFilePath}`);
    console.error('Proceeding without loading environment variables.');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
  }

  try {
    const products = await fetchProducts();
    const configString = generateConfigString(products);
    
    // Output the configuration to stdout
    console.log(configString);
    
    console.error('Configuration pulled from Stripe and output to stdout');
  } catch (error) {
    console.error('Error pulling configuration from Stripe:', error);
    throw error;
  }
}