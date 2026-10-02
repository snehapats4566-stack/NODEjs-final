require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('./src/models/Pet');
const User = require('./src/models/User');

const samplePets = [
  {
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 2,
    species: 'dog',
    gender: 'male',
    description: 'Friendly, playful, and always ready for a walk or a cuddle after a long day.',
    photoPath: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Luna',
    breed: 'Siamese Cat',
    age: 1,
    species: 'cat',
    gender: 'female',
    description: 'A graceful little companion with bright eyes, a calm temperament, and a love for sunny windowsills.',
    photoPath: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Charlie',
    breed: 'Border Collie',
    age: 3,
    species: 'dog',
    gender: 'male',
    description: 'Intelligent, energetic, and quick to learn. Perfect for an active family who loves outdoor adventures.',
    photoPath: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Milo',
    breed: 'Tabby Cat',
    age: 2,
    species: 'cat',
    gender: 'male',
    description: 'Sweet and curious with a playful grin and a habit of following people around the house.',
    photoPath: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Daisy',
    breed: 'Labrador',
    age: 4,
    species: 'dog',
    gender: 'female',
    description: 'Gentle, patient, and incredibly social. Great with kids and other pets.',
    photoPath: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Pepper',
    breed: 'Parakeet',
    age: 1,
    species: 'bird',
    gender: 'female',
    description: 'Chirpy, bright, and full of personality. Loves music and spending time with people.',
    photoPath: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Coco',
    breed: 'Mini Lop Rabbit',
    age: 1,
    species: 'rabbit',
    gender: 'female',
    description: 'Soft, gentle, and affectionate. Loves quiet moments and fresh veggies.',
    photoPath: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Rocky',
    breed: 'German Shepherd',
    age: 5,
    species: 'dog',
    gender: 'male',
    description: 'Loyal, protective, and deeply affectionate once he trusts you. A great companion for a stable home.',
    photoPath: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Nina',
    breed: 'Persian Cat',
    age: 2,
    species: 'cat',
    gender: 'female',
    description: 'Calm and elegant, with a soft nature and a love for being near her favorite humans.',
    photoPath: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Sunny',
    breed: 'Cocker Spaniel',
    age: 3,
    species: 'dog',
    gender: 'male',
    description: 'Happy-go-lucky and loving. Always eager to play, be cuddled, and make everyone smile.',
    photoPath: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Pip',
    breed: 'Canary',
    age: 1,
    species: 'bird',
    gender: 'male',
    description: 'A light-hearted little singer with a cheerful personality and beautiful songs.',
    photoPath: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Hazel',
    breed: 'Holland Lop',
    age: 2,
    species: 'rabbit',
    gender: 'female',
    description: 'Gentle and affectionate, happiest in a calm home with lots of soft attention and fresh greens.',
    photoPath: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Max',
    breed: 'Beagle',
    age: 4,
    species: 'dog',
    gender: 'male',
    description: 'Lively and curious with a nose for adventure. Loves exploring and then curling up beside you.',
    photoPath: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Mochi',
    breed: 'Bengal Cat',
    age: 2,
    species: 'cat',
    gender: 'female',
    description: 'Energetic and affectionate, with striking markings and a playful streak that never stops.',
    photoPath: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Apollo',
    breed: 'Mixed Breed',
    age: 3,
    species: 'other',
    gender: 'male',
    description: 'A lovable little adventurer who warms up quickly and enjoys being part of the family.',
    photoPath: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Bella',
    breed: 'Poodle',
    age: 2,
    species: 'dog',
    gender: 'female',
    description: 'Smart, affectionate, and wonderfully social. Ready to join a loving home with plenty of attention.',
    photoPath: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Kiwi',
    breed: 'Cockatiel',
    age: 1,
    species: 'bird',
    gender: 'female',
    description: 'Bright, gentle, and very interactive. Loves whistles, songs, and friendly company.',
    photoPath: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Maple',
    breed: 'Netherland Dwarf Rabbit',
    age: 1,
    species: 'rabbit',
    gender: 'female',
    description: 'Tiny, sweet, and endlessly charming. Perfect for someone who wants a calm, affectionate companion.',
    photoPath: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
  {
    name: 'Oscar',
    breed: 'Scottish Fold',
    age: 3,
    species: 'cat',
    gender: 'male',
    description: 'A laid-back sweetheart who enjoys cozy naps, gentle play, and plenty of affection.',
    photoPath: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80',
    status: 'available',
  },
];

async function seedSamplePets({ minimumPets = 20 } = {}) {
  try {
    const adminUser = (await User.findOne({ role: 'admin' })) || (await User.findOne({}));

    if (!adminUser) {
      console.log('⚠️ No users found. Skipping sample pet seeding.');
      return;
    }

    const currentCount = await Pet.countDocuments();

    if (currentCount >= minimumPets) {
      console.log(`✅ ${currentCount} pets already exist. Minimum catalog target reached.`);
      return;
    }

    const petsToInsert = samplePets
      .slice(0, minimumPets - currentCount)
      .map((pet) => ({
        ...pet,
        addedBy: adminUser._id,
      }));

    if (!petsToInsert.length) {
      console.log('✅ No new sample pets needed.');
      return;
    }

    await Pet.insertMany(petsToInsert);
    console.log(`✅ Seeded ${petsToInsert.length} sample pets for visitors.`);
  } catch (error) {
    console.error('❌ Failed to seed sample pets:', error.message);
  }
}

module.exports = seedSamplePets;

if (require.main === module) {
  const connectDB = require('./src/config/db');

  (async () => {
    try {
      await connectDB();
      await seedSamplePets({ minimumPets: 20 });
      process.exit(0);
    } catch (error) {
      console.error('Seed script failed:', error.message);
      process.exit(1);
    }
  })();
}
