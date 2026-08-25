import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const categories = await Category.find({});
    console.log('Categories in database:');
    categories.forEach(cat => {
      console.log(`Name: ${cat.name}`);
      console.log(`Image: ${cat.image}`);
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
