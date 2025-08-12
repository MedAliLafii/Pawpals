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
  { nom: 'Chien', description: 'Tout pour l\'alimentation, la santé et le bien-être de votre chien.' },
  { nom: 'Chat', description: 'Large choix de nourritures et accessoires pour chats heureux.' },
  { nom: 'Oiseau', description: 'Alimentation adaptée pour oiseaux domestiques et exotiques.' }
];

const products = [
  // Dog Food Products (using chien1-7.webp)
  {
    nom: 'POULET, COURGE, MYRTILLE',
    description: 'Voilà la recette mono-protéine idéale pour les chiens stérilisés qui veulent retrouver la ligne ! Elle contient 70% de poulet, une viande maigre, peu calorique et riche en protéines pour avoir la pêche, des fruits et des légumes pour faire le plein de vitamines et de fibres, des minéraux et des prébiotiques pour renforcer la santé intestinale. Et roule ma poule !',
    prix: 49.99,
    stock: 11,
    imageURL: 'chien1.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'Croquettes Sans Céréales Chien Digestion Sensible',
    description: 'Nos croquettes fabriquées sans céréales pour chien Digestion Sensible contiennent de l agneau qui est une excellente source de protéines. Elles sont adaptées à tous les chiens, notamment ceux présentant des sensibilités digestives.',
    prix: 12.50,
    stock: 150,
    imageURL: 'chien2.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'DINDE, CANARD, COURGE',
    description: 'Une délicieuse recette sans céréales avec 50% de canard et de dinde, accompagnée de super-aliments comme l\'huile de saumon ou les graines de lin riches en nutriments : des antioxydants pour l\'immunité, des prébiotiques pour la digestion et des oméga-3 pour la peau et le pelage.',
    prix: 39.99,
    stock: 80,
    imageURL: 'chien3.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'POULET, FRAMBOISE, ORIGAN',
    description: 'Plutôt laile ou la cuisse ? Peu importe ! Notre pâtée mono-protéine contient 70% de poulet pour faire plaisir aux fans de volailles ! Formulée avec des prébiotiques et de l origan, une herbe aromatique qui facilite le transit et lutte contre la constipation.',
    prix: 9.99,
    stock: 120,
    imageURL: 'chien4.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'STICKS MENTHE, SAUGE',
    description: 'Marre des léchouilles puantes de votre chien ? Découvrez nos sticks dentaires pour laider à retrouver une haleine à bisous ! La menthe est une plante riche en vitamines qui favorisent une meilleure haleine, tandis que la sauge améliore le confort digestif.',
    prix: 34.50,
    stock: 75,
    imageURL: 'chien5.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'GUMMIES ARTICULATIONS',
    description: 'Soulagez les douleurs articulaires de votre chien et aidez le à retrouver sa mobilité avec nos gummies Articulations ! Formulés par des vétérinaires et experts en nutrition, ils contiennent 12 principes actifs comme la glucosamine, le MSM et le sulfate de chondroïtine.',
    prix: 31.50,
    stock: 75,
    imageURL: 'chien6.webp',
    categorieNom: 'Chien'
  },
  {
    nom: 'GUMMIES PROBIOTIQUES',
    description: 'Améliorez la digestion de votre chien avec nos gummies aux 6 principes actifs parfaitement équilibrés entre probiotiques et prébiotiques ! Des délicieuses bouchées pour soutenir la flore intestinale et aider à une meilleure absorption des nutriments.',
    prix: 30.50,
    stock: 75,
    imageURL: 'chien7.webp',
    categorieNom: 'Chien'
  },

  // Cat Food Products (using chat1-4.webp)
  {
    nom: 'POULET, THON, SAUMON',
    description: 'Avis aux minets stérilisés ! Voilà la recette idéale pour les chats en quête d\'équilibre. Elle contient 70% poulet et de poisson, une parfaite combinaison entre une viande maigre et complète pour garder la ligne et du poisson pour faire le plein d oméga-3.',
    prix: 35.50,
    stock: 75,
    imageURL: 'chat1.webp',
    categorieNom: 'Chat'
  },
  {
    nom: 'CANARD, VALÉRIANE',
    description: 'Avis aux fins gourmets ! Cette délicieuse pâtée mono-protéine a été préparée avec 65% de canard, une viande peu allergène, savoureuse et riche en goût. De quoi combler le palais de votre chat stérilisé.',
    prix: 20.50,
    stock: 75,
    imageURL: 'chat2.webp',
    categorieNom: 'Chat'
  },
  {
    nom: 'CANARD, POULET, POMME',
    description: 'Voilà la recette idéale pour les amateurs de volaille en sauce ultra savoureuse ! Elle contient 85% de filets de poulet et de canard, pour varier les apports en protéines. De la pomme pour faire le plein de fibres et faciliter la digestion.',
    prix: 20.50,
    stock: 75,
    imageURL: 'chat3.webp',
    categorieNom: 'Chat'
  },
  {
    nom: 'HUILE DE CHANVRE BIO',
    description: 'Grâce à ses nombreux bienfaits, l huile de chanvre est le meilleur allié pour préserver la santé de votre chat. Elle permet de renforcer l immunité, de réduire les inflammations et de calmer son stress.',
    prix: 25.50,
    stock: 75,
    imageURL: 'chat4.webp',
    categorieNom: 'Chat'
  },

  // Bird Food Products (using bird4.jpg, bird5.jpg, oiseau.webp)
  {
    nom: 'Mélange Pigeon « Élevage Spécial 102 » 25kg',
    description: 'Mélange élevage pour pigeons de qualité supérieure, riche en protéines et vitamines essentielles pour la santé et la reproduction.',
    prix: 25.50,
    stock: 75,
    imageURL: 'oiseau.webp',
    categorieNom: 'Oiseau'
  },
  {
    nom: 'Graines Premium pour Oiseaux Exotiques',
    description: 'Mélange spécialement formulé pour les oiseaux exotiques, contenant des graines de haute qualité et des fruits séchés.',
    prix: 18.99,
    stock: 50,
    imageURL: 'bird4.jpg',
    categorieNom: 'Oiseau'
  },
  {
    nom: 'Nourriture Complète pour Perruches',
    description: 'Alimentation équilibrée pour perruches et petits oiseaux, enrichie en vitamines et minéraux essentiels.',
    prix: 15.75,
    stock: 60,
    imageURL: 'bird5.jpg',
    categorieNom: 'Oiseau'
  }
];

// Sample adoption pets (using dog1-4.jpg, cat2-4.jpg, parrot1-3.png, mimi.jpg)
const adoptionPets = [
  {
    clientID: 1,
    petName: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    type: 'Dog',
    gender: 'Male',
    imageURL: 'dog1.webp',
    location: 'Tunis',
    shelter: 'Happy Paws Shelter',
    description: 'Friendly and energetic Golden Retriever looking for an active family. Loves playing fetch and going for walks.',
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
    imageURL: 'cat2.jpg',
    location: 'Sfax',
    shelter: 'Feline Friends',
    description: 'Beautiful Persian cat, calm and affectionate. Perfect for a quiet home environment.',
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
    imageURL: 'dog2.jpg',
    location: 'Sousse',
    shelter: 'Second Chance Shelter',
    description: 'Young and playful mixed breed dog, great with children. Very energetic and loves outdoor activities.',
    goodWithKids: 1,
    goodWithOtherPets: 1,
    houseTrained: 0,
    specialNeeds: 0
  },
  {
    clientID: 1,
    petName: 'Mimi',
    breed: 'Domestic Shorthair',
    age: 4,
    type: 'Cat',
    gender: 'Female',
    imageURL: 'mimi.jpg',
    location: 'Tunis',
    shelter: 'Cat Care Center',
    description: 'Sweet and gentle cat, loves cuddles and quiet time. Perfect companion for a calm household.',
    goodWithKids: 1,
    goodWithOtherPets: 1,
    houseTrained: 1,
    specialNeeds: 0
  },
  {
    clientID: 1,
    petName: 'Charlie',
    breed: 'African Grey Parrot',
    age: 5,
    type: 'Bird',
    gender: 'Male',
    imageURL: 'parrot1.jpg',
    location: 'Sfax',
    shelter: 'Winged Friends',
    description: 'Intelligent and talkative African Grey parrot. Loves interaction and can learn many words and phrases.',
    goodWithKids: 1,
    goodWithOtherPets: 0,
    houseTrained: 1,
    specialNeeds: 0
  }
];

// Sample lost pets (using remaining images)
const lostPets = [
  {
    clientID: 1,
    petName: 'Fluffy',
    breed: 'Maine Coon',
    age: 4,
    type: 'Cat',
    imageURL: 'cat3.jpg',
    dateLost: '2024-01-15',
    location: 'Tunis',
    description: 'Large orange Maine Coon cat, very friendly, responds to "Fluffy". Wearing a red collar with bell.'
  },
  {
    clientID: 1,
    petName: 'Rocky',
    breed: 'German Shepherd',
    age: 5,
    type: 'Dog',
    imageURL: 'dog3.jpg',
    dateLost: '2024-01-20',
    location: 'Sfax',
    description: 'Black and tan German Shepherd, wearing blue collar with ID tag. Very friendly and responds to commands.'
  },
  {
    clientID: 1,
    petName: 'Sky',
    breed: 'Blue Parrot',
    age: 3,
    type: 'Bird',
    imageURL: 'parrot2.jpg',
    dateLost: '2024-01-25',
    location: 'Sousse',
    description: 'Beautiful blue parrot, very vocal and friendly. Responds to "Sky" and loves sunflower seeds.'
  },
  {
    clientID: 1,
    petName: 'Shadow',
    breed: 'Domestic Shorthair',
    age: 2,
    type: 'Cat',
    imageURL: 'cat4.jpg',
    dateLost: '2024-01-30',
    location: 'Tunis',
    description: 'Black cat with white paws, very shy but friendly once comfortable. Responds to "Shadow".'
  },
  {
    clientID: 1,
    petName: 'Rex',
    breed: 'Rottweiler',
    age: 6,
    type: 'Dog',
    imageURL: 'dog4.jpg',
    dateLost: '2024-02-01',
    location: 'Sfax',
    description: 'Large Rottweiler with brown markings, wearing a black collar. Very loyal and protective.'
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
        DELETE FROM commande_produit;
        DELETE FROM commande;
        DELETE FROM panier_produit;
        DELETE FROM panier;
        DELETE FROM lostpet;
        DELETE FROM adoptionpet;
        DELETE FROM produit;
        DELETE FROM categorie;
        DELETE FROM client WHERE clientID > 1;
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Reset auto-increment counters
    console.log('Resetting auto-increment counters...');
    await new Promise((resolve, reject) => {
      connection.query(`
        ALTER TABLE categorie AUTO_INCREMENT = 1;
        ALTER TABLE produit AUTO_INCREMENT = 1;
        ALTER TABLE adoptionpet AUTO_INCREMENT = 1;
        ALTER TABLE lostpet AUTO_INCREMENT = 1;
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
          'INSERT INTO categorie (nom, description) VALUES (?, ?)',
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
      connection.query('SELECT categorieID, nom FROM categorie', (err, results) => {
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
          'INSERT INTO produit (nom, description, prix, stock, imageURL, categorieID) VALUES (?, ?, ?, ?, ?, ?)',
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
          `INSERT INTO adoptionpet (clientID, petName, breed, age, type, gender, imageURL, location, shelter, description, goodWithKids, goodWithOtherPets, houseTrained, specialNeeds) 
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
          `INSERT INTO lostpet (clientID, petName, breed, age, type, imageURL, dateLost, location, description) 
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
