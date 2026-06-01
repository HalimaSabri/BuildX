import path from 'node:path';

export const config = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
  tokenSecret: process.env.TOKEN_SECRET ?? 'dev-token-secret-change-me',
  dataFile: path.resolve(process.cwd(), process.env.DATA_FILE ?? './data/db.json'),
};
