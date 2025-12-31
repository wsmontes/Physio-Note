const mongoose = require('mongoose');
require('dotenv').config();
const Template = require('../models/template.model');
const User = require('../models/user.model');
const preBuiltTemplates = require('./templates.seed');

/**
 * Seed pre-built public templates into the database
 * Creates a system user if needed and assigns templates to it
 */
async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create system user for public templates
    let systemUser = await User.findOne({ email: 'system@physionote.app' });
    
    if (!systemUser) {
      console.log('Creating system user for public templates...');
      systemUser = await User.create({
        firstName: 'PhysioNote',
        lastName: 'System',
        email: 'system@physionote.app',
        password: Math.random().toString(36).substring(2, 15) // Random password, won't be used
      });
      console.log('✅ System user created');
    }

    // Check how many public templates already exist
    const existingCount = await Template.countDocuments({ isPublic: true });
    console.log(`📊 Found ${existingCount} existing public templates`);

    // Clear existing public templates if forcing
    if (process.argv.includes('--force')) {
      const deleted = await Template.deleteMany({ isPublic: true });
      console.log(`🗑️  Deleted ${deleted.deletedCount} existing public templates`);
    } else if (existingCount >= preBuiltTemplates.length) {
      console.log('✅ Public templates already seeded. Use --force to re-seed.');
      process.exit(0);
    }

    // Add userId to all templates
    const templatesWithUser = preBuiltTemplates.map(template => ({
      ...template,
      userId: systemUser._id
    }));

    // Insert templates
    const inserted = await Template.insertMany(templatesWithUser, { ordered: false });
    console.log(`✅ Successfully seeded ${inserted.length} public templates`);

    // Summary by specialty
    const summary = await Template.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📋 Templates by specialty:');
    summary.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} templates`);
    });

    console.log('\n✨ Template seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTemplates();
}

module.exports = seedTemplates;
