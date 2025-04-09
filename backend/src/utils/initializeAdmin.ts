import Faculty, { IFaculty } from '../models/Faculty';
import Subject from '../models/Subject';
import bcrypt from 'bcryptjs';

const sampleSubjects = [
  { courseTitle: 'Introduction to Information Technology', courseCode: 'IT 101' },
  { courseTitle: 'Programming Fundamentals', courseCode: 'IT 112' },
  { courseTitle: 'Object-Oriented Programming', courseCode: 'IT 121' },
  { courseTitle: 'Web Systems and Technologies', courseCode: 'IT 214' },
  { courseTitle: 'Database Management Systems', courseCode: 'IT 221' },
];

const initializeAdmin = async () => {
  try {
    console.log('Checking for admin in faculty collection...');

    const adminExists = await Faculty.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('No admin found. Creating default admin account...');

      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD!, 10);
      const admin: IFaculty = new Faculty({
        first_name: process.env.DEFAULT_ADMIN_FIRST_NAME,
        middle_name: process.env.DEFAULT_ADMIN_MIDDLE_NAME,
        last_name: process.env.DEFAULT_ADMIN_LAST_NAME,
        username: process.env.DEFAULT_ADMIN_USERNAME!,
        email: process.env.DEFAULT_ADMIN_EMAIL!,
        password: hashedPassword,
        role: 'admin',
        status: process.env.DEFAULT_ADMIN_STATUS,
      });

      await admin.save();
      console.log('Default admin account created successfully in the faculty collection.');
    } else {
      console.log('Admin account already exists in the faculty collection:', adminExists);
    }

    console.log('Cleaning invalid subject entries...');
    await Subject.deleteMany({ courseCode: null });

    console.log('Inserting sample subjects if not already present...');
    for (const subject of sampleSubjects) {
      const exists = await Subject.findOne({ courseCode: subject.courseCode });
      if (!exists) {
        await new Subject(subject).save();
        console.log(`Inserted: ${subject.courseCode} - ${subject.courseTitle}`);
      } else {
        console.log(`Skipped (already exists): ${subject.courseCode}`);
      }
    }

    console.log('Subject initialization completed.');

  } catch (error) {
    console.error('Error initializing admin and subjects:', error);
  }
};

export default initializeAdmin;
