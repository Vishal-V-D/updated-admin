import { createClerkClient } from '@clerk/backend';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 1. Load Environment Variables from .env or .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');

  let loadedPath = '';

  if (fs.existsSync(envPath)) {
    loadedPath = envPath;
  } else if (fs.existsSync(envLocalPath)) {
    loadedPath = envLocalPath;
  } else {
    console.error('❌ Error: Neither .env nor .env.local file found!');
    process.exit(1);
  }

  const envConfig = fs.readFileSync(loadedPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });

  if (!process.env.CLERK_SECRET_KEY) {
    console.error(
      '❌ Error: CLERK_SECRET_KEY is missing in ' + path.basename(loadedPath)
    );
    process.exit(1);
  }
}

// 2. Initialize Clerk Client
loadEnv();
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 --- Create Admin User Script --- 🔐\n');

  try {
    // 3. Get User Details
    const email = await askQuestion('Enter Admin Email: ');
    if (!email) throw new Error('Email is required');

    const firstName = await askQuestion('Enter First Name: ');
    const lastName = await askQuestion('Enter Last Name: ');
    const password = await askQuestion('Enter Password: '); // Optional

    if (!password || password.length < 8) {
      console.log(
        '⚠️ Password missed or too short. You will need to sign in via Email Magic Link.'
      );
    }

    console.log('\n⏳ Creating user...');

    // 4. Create User in Clerk
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName: firstName,
      lastName: lastName,
      password: password || undefined,
      skipPasswordChecks: true, // Allow simple passwords for dev if needed
      publicMetadata: {
        role: 'admin' // 👈 THE MAGIC PART: Sets you as Admin immediately
      }
    });

    console.log('\n✅ SUCCESS! Admin user created:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Name: ${user.firstName} ${user.lastName}`);
    console.log(`- Email: ${user.emailAddresses[0].emailAddress}`);
    console.log(`- Role: ${(user.publicMetadata as any).role}`);

    console.log(
      '\n🚀 You can now log in at http://localhost:3000/auth/sign-in'
    );
  } catch (error: any) {
    if (error.errors && error.errors[0]?.message) {
      console.error(`\n❌ Error: ${error.errors[0].message}`);
    } else {
      console.error('\n❌ An error occurred:', error.message || error);
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
