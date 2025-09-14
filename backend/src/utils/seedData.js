const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Note = require('../models/Note');

async function seedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    Tenant.deleteMany({}),
    User.deleteMany({}),
    Note.deleteMany({})
  ]);

  const acme = new Tenant({ slug: 'acme', name: 'Acme Corporation', subscription: 'free' });
  const globex = new Tenant({ slug: 'globex', name: 'Globex Corporation', subscription: 'free' });
  
  await acme.save();
  await globex.save();

  const users = [
    { email: 'admin@acme.test', password: 'password', role: 'admin', tenantId: acme._id },
    { email: 'user@acme.test', password: 'password', role: 'member', tenantId: acme._id },
    { email: 'admin@globex.test', password: 'password', role: 'admin', tenantId: globex._id },
    { email: 'user@globex.test', password: 'password', role: 'member', tenantId: globex._id }
  ];

  for (const u of users) {
  const user = new User(u);
  await user.save();
}


  const acmeUser = await User.findOne({ email: 'user@acme.test' });
  const globexUser = await User.findOne({ email: 'user@globex.test' });

  const notes = [
    {
      title: 'Welcome to Acme Notes',
      content: 'This is your first note in Acme tenant.',
      authorId: acmeUser._id,
      tenantId: acme._id,
      tags: ['welcome', 'acme']
    },
    {
      title: 'Globex Project Ideas',
      content: 'Ideas for projects at Globex.',
      authorId: globexUser._id,
      tenantId: globex._id,
      tags: ['ideas', 'globex']
    }
  ];

  await Note.insertMany(notes);

  console.log('Seeding completed!');
  process.exit(0);
}

seedData().catch(console.error);
