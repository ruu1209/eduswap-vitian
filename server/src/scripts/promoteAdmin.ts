import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/user.model';
import { logger } from '../config/logger';

/** Promotes an existing user to admin. Usage: npm run seed:admin -- <email> */
async function run(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    logger.error('Usage: npm run seed:admin -- <email>');
    process.exit(1);
  }

  await connectDatabase();
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin', isVerified: true },
    { new: true },
  );

  if (!user) logger.error(`No user found with email ${email}`);
  else logger.info(`${email} is now an admin`);

  await disconnectDatabase();
  process.exit(user ? 0 : 1);
}

run().catch((err) => {
  logger.error('promoteAdmin failed', err);
  process.exit(1);
});
