// config/keys.ts
import dotenv from 'dotenv';
dotenv.config();

export const keys = {
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  sessionSecret: process.env.SESSION_SECRET!,
};