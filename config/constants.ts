// general constants
import { getEnvVar } from './config.utils';
import { Stage } from './enums/stage.enum';

// just for now, will raplce wen figure out deployment process
export const STAGE = /*getEnvVar('STAGE') || */ Stage.Staging;
// export const PRODUCTION = STAGE === Stage.Production;

// Data Access Constants
export const BADGER_API_PRODUCTION_URL = 'https://api.badger.com/';
export const BADGER_API_STAGING_URL = 'https://staging-api.badger.com/';

// Text Constants
export const DISCORD_URL = 'https://discord.gg/P9dPNXYv';
export const TWITTER_URL = 'https://twitter.com/BadgerDAO';

// Web3 Constants
export const CHAIN_ID = 1;
