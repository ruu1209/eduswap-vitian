/**
 * Seeds demo data so a fresh deployment isn't empty.
 * Usage: npm run seed:demo   (safe to re-run — it only touches demo.edu data)
 *
 * Creates verified demo students + an admin, plus sample resources and books.
 * Images use placeholder URLs so it works without Cloudinary.
 */
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/user.model';
import { Resource } from '../models/resource.model';
import { Book } from '../models/book.model';
import { logger } from '../config/logger';

const DEMO_COLLEGE = 'demo.edu';
const PASSWORD = 'DemoPass1';

const img = (seed: string) => ({ url: `https://picsum.photos/seed/${seed}/600/800`, publicId: `demo/${seed}` });

async function upsertUser(name: string, email: string, role: 'student' | 'admin') {
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name, email, password: PASSWORD, role, isVerified: true, college: DEMO_COLLEGE });
    await user.save(); // triggers password hashing
  }
  return user;
}

async function run(): Promise<void> {
  await connectDatabase();

  // Clear previously seeded demo content only (never real user data).
  const demoUsers = await User.find({ college: DEMO_COLLEGE }).select('_id');
  const demoIds = demoUsers.map((u) => u._id);
  await Promise.all([
    Resource.deleteMany({ uploader: { $in: demoIds } }),
    Book.deleteMany({ seller: { $in: demoIds } }),
  ]);

  await upsertUser('Demo Admin', 'admin@demo.edu', 'admin');
  const asha = await upsertUser('Asha Rao', 'asha@demo.edu', 'student');
  const vikram = await upsertUser('Vikram Nair', 'vikram@demo.edu', 'student');

  await Resource.create([
    {
      title: 'Operating Systems — Full Unit Notes', description: 'Handwritten notes covering all five units with diagrams.',
      subject: 'Operating Systems', department: 'CSE', semester: 4, courseCode: 'CS3001', type: 'notes',
      tags: ['os', 'unit1-5', 'exam'], isFree: true, price: 0, images: [img('os1')], uploader: asha._id, college: DEMO_COLLEGE,
    },
    {
      title: 'DBMS Lab Manual + Solved Queries', description: 'All lab experiments with solved SQL queries and outputs.',
      subject: 'Database Systems', department: 'CSE', semester: 4, courseCode: 'CS3002', type: 'pdf',
      tags: ['dbms', 'sql', 'lab'], isFree: false, price: 49, images: [img('dbms1')], uploader: vikram._id, college: DEMO_COLLEGE,
    },
    {
      title: 'Signals & Systems — Formula Sheet', description: 'One-page revision sheet for the end-sem.',
      subject: 'Signals and Systems', department: 'ECE', semester: 3, courseCode: 'EC2003', type: 'slides',
      tags: ['ece', 'revision'], isFree: true, price: 0, images: [img('sig1')], uploader: asha._id, college: DEMO_COLLEGE,
    },
    {
      title: 'Data Structures Assignment Solutions', description: 'Worked solutions for assignments 1–4.',
      subject: 'Data Structures', department: 'IT', semester: 3, courseCode: 'IT2001', type: 'assignment',
      tags: ['dsa', 'assignment'], isFree: true, price: 0, images: [img('dsa1')], uploader: vikram._id, college: DEMO_COLLEGE,
    },
  ]);

  await Book.create([
    {
      title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.', description: 'Third edition, light highlighting.',
      subject: 'Algorithms', department: 'CSE', condition: 'good', price: 350, isNegotiable: true,
      images: [img('clrs')], seller: asha._id, college: DEMO_COLLEGE, status: 'available',
    },
    {
      title: 'Operating System Concepts', author: 'Silberschatz', edition: '9th', condition: 'like_new', price: 400,
      isNegotiable: false, images: [img('osbook')], seller: vikram._id, college: DEMO_COLLEGE, status: 'available',
    },
    {
      title: 'Digital Design', author: 'Morris Mano', condition: 'fair', price: 200, isNegotiable: true,
      images: [img('ddbook')], seller: asha._id, college: DEMO_COLLEGE, status: 'sold',
    },
  ]);

  logger.info('Demo data seeded:');
  logger.info(`  admin login:   admin@demo.edu / ${PASSWORD}`);
  logger.info(`  student login: asha@demo.edu / ${PASSWORD}`);
  logger.info('  4 resources, 3 books created.');

  await disconnectDatabase();
  process.exit(0);
}

run().catch((err) => {
  logger.error('seedDemo failed', err);
  process.exit(1);
});
