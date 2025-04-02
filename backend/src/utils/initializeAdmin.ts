import Faculty, { IFaculty } from '../models/Faculty';
import bcrypt from 'bcryptjs';

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
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

export default initializeAdmin;