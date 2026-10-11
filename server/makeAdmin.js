// Usage: npm run make-admin -- you@example.com   (register on the site first)
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models.js';

const email = process.argv[2]?.toLowerCase();
if (!email) { console.log('Usage: npm run make-admin -- email@example.com'); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
const u = await User.findOneAndUpdate({ email }, { role: 'admin' });
console.log(u ? `${email} is now an admin. Log out and log in again.` : 'No user with that email. Register on the site first.');
await mongoose.disconnect();
