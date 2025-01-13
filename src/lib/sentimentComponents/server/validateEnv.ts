export function validateEnv() {
    const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    
    for (const variable of required) {
        if (!process.env[variable]) {
            throw new Error(`Missing required environment variable: ${variable}`);
        }
    }
}

// Then in your +server.ts, add at the top:
import { validateEnv } from '$lib/server/validateEnv';
validateEnv();