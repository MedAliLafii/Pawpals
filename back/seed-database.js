const mysql = require('mysql');
require('dotenv').config({ path: '../.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'pawpals',
  multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

// Sample data
const categories = [
  { nom: 'Dog Food', description: 'High-quality food for dogs of all ages and sizes' },
  { nom: 'Cat Food', description: 'Nutritious food for cats and kittens' },
  { nom: 'Toys', description: 'Fun and engaging toys for pets' },
  { nom: 'Accessories', description: 'Collars, leashes, and other pet accessories' },
  { nom: 'Health & Care', description: 'Health supplements and grooming products' },
  { nom: 'Beds & Furniture', description: 'Comfortable beds and furniture for pets' },
  { nom: 'Training', description: 'Training tools and equipment' }
];

const products = [
  // Dog Food
  {
    nom: 'Premium Dog Food - Adult',
    description: 'High-quality dry food for adult dogs with balanced nutrition',
    prix: 29.99,
    stock: 50,
    imageURL: '/assets/images/dog-food-1.jpg',
    categorieNom: 'Dog Food'
  },
  {
    nom: 'Puppy Food - Growth Formula',
    description: 'Specially formulated for puppies up to 12 months',
    prix: 34.99,
    stock: 30,
    imageURL: '/assets/images/dog-food-2.jpg',
    categorieNom: 'Dog Food'
  },
  {
    nom: 'Senior Dog Food - Joint Health',
    description: 'Formulated for senior dogs with joint support',
    prix: 39.99,
    stock: 25,
    imageURL: '/assets/images/dog-food-3.jpg',
    categorieNom: 'Dog Food'
  },

  // Cat Food
  {
    nom: 'Premium Cat Food - Indoor',
    description: 'Specially formulated for indoor cats',
    prix: 24.99,
    stock: 40,
    imageURL: '/assets/images/cat-food-1.jpg',
    categorieNom: 'Cat Food'
  },
  {
    nom: 'Kitten Food - Growth Formula',
    description: 'Complete nutrition for kittens up to 12 months',
    prix: 27.99,
    stock: 35,
    imageURL: '/assets/images/cat-food-2.jpg',
    categorieNom: 'Cat Food'
  },
  {
    nom: 'Cat Food - Weight Control',
    description: 'Helps maintain healthy weight for adult cats',
    prix: 26.99,
    stock: 30,
    imageURL: '/assets/images/cat-food-3.jpg',
    categorieNom: 'Cat Food'
  },

  // Toys
  {
    nom: 'Interactive Dog Toy Ball',
    description: 'Durable ball that dispenses treats as your dog plays',
    prix: 19.99,
    stock: 60,
    imageURL: '/assets/images/dog-toy-1.jpg',
    categorieNom: 'Toys'
  },
  {
    nom: 'Cat Teaser Wand',
    description: 'Interactive wand with feathers for engaging play',
    prix: 12.99,
    stock: 45,
    imageURL: '/assets/images/cat-toy-1.jpg',
    categorieNom: 'Toys'
  },
  {
    nom: 'Chew Toy - Durable',
    description: 'Long-lasting chew toy for aggressive chewers',
    prix: 15.99,
    stock: 40,
    imageURL: '/assets/images/dog-toy-2.jpg',
    categorieNom: 'Toys'
  },

  // Accessories
  {
    nom: 'Adjustable Dog Collar',
    description: 'Comfortable nylon collar with quick-release buckle',
    prix: 18.99,
    stock: 70,
    imageURL: '/assets/images/collar-1.jpg',
    categorieNom: 'Accessories'
  },
  {
    nom: 'Retractable Dog Leash',
    description: '16ft retractable leash with ergonomic handle',
    prix: 34.99,
    stock: 25,
    imageURL: '/assets/images/leash-1.jpg',
    categorieNom: 'Accessories'
  },
  {
    nom: 'Cat Harness & Leash Set',
    description: 'Comfortable harness with matching leash for cats',
    prix: 22.99,
    stock: 30,
    imageURL: '/assets/images/cat-harness.jpg',
    categorieNom: 'Accessories'
  },

  // Health & Care
  {
    nom: 'Joint Health Supplement',
    description: 'Glucosamine supplement for joint health',
    prix: 28.99,
    stock: 35,
    imageURL: '/assets/images/supplement-1.jpg',
    categorieNom: 'Health & Care'
  },
  {
    nom: 'Pet Grooming Kit',
    description: 'Complete grooming kit with brushes and combs',
    prix: 45.99,
    stock: 20,
    imageURL: '/assets/images/grooming-kit.jpg',
    categorieNom: 'Health & Care'
  },
  {
    nom: 'Dental Care Kit',
    description: 'Toothbrush and toothpaste for pets',
    prix: 16.99,
    stock: 40,
    imageURL: '/assets/images/dental-kit.jpg',
    categorieNom: 'Health & Care'
  },

  // Beds & Furniture
  {
    nom: 'Orthopedic Dog Bed',
    description: 'Memory foam bed for joint support',
    prix: 89.99,
    stock: 15,
    imageURL: '/assets/images/dog-bed-1.jpg',
    categorieNom: 'Beds & Furniture'
  },
  {
    nom: 'Cat Tree with Scratching Posts',
    description: 'Multi-level cat tree with built-in scratching posts',
    prix: 129.99,
    stock: 10,
    imageURL: '/assets/images/cat-tree.jpg',
    categorieNom: 'Beds & Furniture'
  },
  {
    nom: 'Pet Carrier - Travel',
    description: 'Comfortable carrier for travel and vet visits',
    prix: 49.99,
    stock: 25,
    imageURL: '/assets/images/pet-carrier.jpg',
    categorieNom: 'Beds & Furniture'
  },

  // Training
  {
    nom: 'Clicker Training Kit',
    description: 'Clicker with training guide for positive reinforcement',
    prix: 14.99,
    stock: 50,
    imageURL: '/assets/images/clicker.jpg',
    categorieNom: 'Training'
  },
  {
    nom: 'Training Treats - Small',
    description: 'Soft training treats perfect for small dogs',
    prix: 8.99,
    stock: 80,
    imageURL: '/assets/images/training-treats.jpg',
    categorieNom: 'Training'
  },
  {
    nom: 'Pet Training Pads',
    description: 'Absorbent training pads for housebreaking',
    prix: 19.99,
    stock: 60,
    imageURL: '/assets/images/training-pads.jpg',
    categorieNom: 'Training'
  }
];

// Sample adoption pets
const adoptionPets = [
  {
    clientID: 1,
    petName: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    type: 'Dog',
    gender: 'Male',
    imageURL: '/assets/images/buddy.jpg',
    location: 'Tunis',
    shelter: 'Happy Paws Shelter',
    description: 'Friendly and energetic Golden Retriever looking for an active family',
    goodWithKids: 1,
    goodWithOtherPets: 1,
    houseTrained: 1,
    specialNeeds: 0
  },
  {
    clientID: 1,
    petName: 'Luna',
    breed: 'Persian Cat',
    age: 2,
    type: 'Cat',
    gender: 'Female',
    imageURL: '/assets/images/luna.jpg',
    location: 'Sfax',
    shelter: 'Feline Friends',
    description: 'Beautiful Persian cat, calm and affectionate',
    goodWithKids: 1,
    goodWithOtherPets: 0,
    houseTrained: 1,
    specialNeeds: 0
  },
  {
    clientID: 1,
    petName: 'Max',
    breed: 'Mixed Breed',
    age: 1,
    type: 'Dog',
    gender: 'Male',
    imageURL: '/assets/images/max.jpg',
    location: 'Sousse',
    shelter: 'Second Chance Shelter',
    description: 'Young and playful mixed breed dog, great with children',
    goodWithKids: 1,
    goodWithOtherPets: 1,
    houseTrained: 0,
    specialNeeds: 0
  }
];

// Sample lost pets
const lostPets = [
  {
    clientID: 1,
    petName: 'Fluffy',
    breed: 'Maine Coon',
    age: 4,
    type: 'Cat',
    imageURL: '/assets/images/fluffy.jpg',
    dateLost: '2024-01-15',
    location: 'Tunis',
    description: 'Large orange Maine Coon cat, very friendly, responds to "Fluffy"'
  },
  {
    clientID: 1,
    petName: 'Rocky',
    breed: 'German Shepherd',
    age: 5,
    type: 'Dog',
    imageURL: '/assets/images/rocky.jpg',
    dateLost: '2024-01-20',
    location: 'Sfax',
    description: 'Black and tan German Shepherd, wearing blue collar with ID tag'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await new Promise((resolve, reject) => {
      connection.query(`
        DELETE FROM Commande_Produit;
        DELETE FROM Commande;
        DELETE FROM Panier_Produit;
        DELETE FROM Panier;
        DELETE FROM LostPet;
        DELETE FROM AdoptionPet;
        DELETE FROM Produit;
        DELETE FROM Categorie;
        DELETE FROM Client WHERE clientID > 1;
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Reset auto-increment counters
    console.log('Resetting auto-increment counters...');
    await new Promise((resolve, reject) => {
      connection.query(`
        ALTER TABLE Categorie AUTO_INCREMENT = 1;
        ALTER TABLE Produit AUTO_INCREMENT = 1;
        ALTER TABLE AdoptionPet AUTO_INCREMENT = 1;
        ALTER TABLE LostPet AUTO_INCREMENT = 1;
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert categories
    console.log('Inserting categories...');
    for (const category of categories) {
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO Categorie (nom, description) VALUES (?, ?)',
          [category.nom, category.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Get category IDs
    console.log('Getting category IDs...');
    const categoryResults = await new Promise((resolve, reject) => {
      connection.query('SELECT categorieID, nom FROM Categorie', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const categoryMap = {};
    categoryResults.forEach(cat => {
      categoryMap[cat.nom] = cat.categorieID;
    });

    // Insert products
    console.log('Inserting products...');
    for (const product of products) {
      const categorieID = categoryMap[product.categorieNom];
      if (!categorieID) {
        console.error(`Category not found: ${product.categorieNom}`);
        continue;
      }

      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO Produit (nom, description, prix, stock, imageURL, categorieID) VALUES (?, ?, ?, ?, ?, ?)',
          [product.nom, product.description, product.prix, product.stock, product.imageURL, categorieID],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Insert adoption pets
    console.log('Inserting adoption pets...');
    for (const pet of adoptionPets) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO AdoptionPet (clientID, petName, breed, age, type, gender, imageURL, location, shelter, description, goodWithKids, goodWithOtherPets, houseTrained, specialNeeds) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pet.clientID, pet.petName, pet.breed, pet.age, pet.type, pet.gender, pet.imageURL, pet.location, pet.shelter, pet.description, pet.goodWithKids, pet.goodWithOtherPets, pet.houseTrained, pet.specialNeeds],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Insert lost pets
    console.log('Inserting lost pets...');
    for (const pet of lostPets) {
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO LostPet (clientID, petName, breed, age, type, imageURL, dateLost, location, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pet.clientID, pet.petName, pet.breed, pet.age, pet.type, pet.imageURL, pet.dateLost, pet.location, pet.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('Database seeded successfully!');
    console.log(`Inserted ${categories.length} categories`);
    console.log(`Inserted ${products.length} products`);
    console.log(`Inserted ${adoptionPets.length} adoption pets`);
    console.log(`Inserted ${lostPets.length} lost pets`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    connection.end();
  }
}

// Run the seeding
seedDatabase();
