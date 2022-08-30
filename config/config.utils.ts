import { Stage } from './enums/stage.enum';

export function getEnvVar(envName: string): string {
  const variable = process.env[envName];

  if (variable) return variable;

  const errMsg = `Missing required env var: ${envName}`;

  if (process.env.STAGE == Stage.Staging) {
    console.error(errMsg);
    return 'Missing value';
  }

  throw new Error(`Missing required env var: ${envName}`);
}

export function getBadgerApiUrl() {
  if (process.env.STAGE == Stage.Production) {
    return 'https://api.badger.com/';
  }

  return 'https://staging-api.badger.com/';
}
