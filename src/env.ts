import * as dotenv from 'dotenv';
dotenv.config();

function required(key:string) {
  const value = process.env[key];
  if (!value) throw new Error(`Environment variable ${key} not found`);
  return value;
}

interface Env {
  API_KEY: string;
  API_URL: string;
}

export const apiEnv: Env = {
  API_KEY: required('API_KEY'),
  API_URL: required('API_URL'),
};
