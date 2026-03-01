import * as dotenv from 'dotenv';
dotenv.config();

interface Env {
  API_KEY: string;
  API_URL: string;
}

export const apiEnv: Env = {
  API_KEY: process.env.API_KEY || '',
  API_URL: process.env.API_URL || '',
};
