-- PostgreSQL Schema for Pawpals
-- Converted from MySQL to PostgreSQL

CREATE TABLE "client" (
  "clientID" SERIAL PRIMARY KEY,
  "nom" varchar(100) NOT NULL,
  "email" varchar(100) NOT NULL UNIQUE,
  "motdepasse" varchar(100) NOT NULL,
  "adresse" varchar(255) DEFAULT NULL,
  "tel" integer DEFAULT NULL,
  "region" varchar(30) DEFAULT NULL
);

CREATE TABLE "categorie" (
  "categorieID" SERIAL PRIMARY KEY,
  "nom" varchar(100) NOT NULL,
  "description" text
);

CREATE TABLE "produit" (
  "produitID" SERIAL PRIMARY KEY,
  "nom" varchar(100) NOT NULL,
  "description" text,
  "prix" decimal(10,2) NOT NULL CHECK ("prix" >= 0),
  "stock" integer NOT NULL CHECK ("stock" >= 0),
  "imageURL" varchar(255) DEFAULT NULL,
  "categorieID" integer DEFAULT NULL,
  "rating" integer DEFAULT NULL,
  FOREIGN KEY ("categorieID") REFERENCES "categorie" ("categorieID") ON DELETE SET NULL
);

CREATE TABLE "panier" (
  "panierID" SERIAL PRIMARY KEY,
  "clientID" integer NOT NULL,
  FOREIGN KEY ("clientID") REFERENCES "client" ("clientID") ON DELETE CASCADE
);

CREATE TABLE "panier_produit" (
  "panierID" integer NOT NULL,
  "produitID" integer NOT NULL,
  "quantite" integer NOT NULL CHECK ("quantite" > 0),
  PRIMARY KEY ("panierID", "produitID"),
  FOREIGN KEY ("panierID") REFERENCES "panier" ("panierID") ON DELETE CASCADE,
  FOREIGN KEY ("produitID") REFERENCES "produit" ("produitID") ON DELETE CASCADE
);

CREATE TABLE "commande" (
  "commandeID" SERIAL PRIMARY KEY,
  "clientID" integer NOT NULL,
  "dateCommande" date NOT NULL,
  "statut" varchar(50) NOT NULL,
  "total" decimal(10,2) NOT NULL CHECK ("total" >= 0),
  FOREIGN KEY ("clientID") REFERENCES "client" ("clientID") ON DELETE CASCADE
);

CREATE TABLE "commande_produit" (
  "commandeID" integer NOT NULL,
  "produitID" integer NOT NULL,
  "quantite" integer NOT NULL CHECK ("quantite" > 0),
  PRIMARY KEY ("commandeID", "produitID"),
  FOREIGN KEY ("commandeID") REFERENCES "commande" ("commandeID") ON DELETE CASCADE,
  FOREIGN KEY ("produitID") REFERENCES "produit" ("produitID") ON DELETE CASCADE
);

CREATE TABLE "adoptionpet" (
  "adoptionPetID" SERIAL PRIMARY KEY,
  "clientID" integer NOT NULL,
  "petName" varchar(100) NOT NULL,
  "breed" varchar(100) DEFAULT NULL,
  "age" integer DEFAULT NULL,
  "gender" varchar(10) DEFAULT NULL,
  "type" varchar(50) DEFAULT NULL,
  "imageURL" varchar(255) DEFAULT NULL,
  "location" varchar(255) DEFAULT NULL,
  "shelter" varchar(100) DEFAULT NULL,
  "description" text,
  "goodWithKids" boolean DEFAULT false,
  "goodWithOtherPets" boolean DEFAULT false,
  "houseTrained" boolean DEFAULT false,
  "specialNeeds" boolean DEFAULT false,
  "datePosted" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("clientID") REFERENCES "client" ("clientID") ON DELETE CASCADE
);

CREATE TABLE "lostpet" (
  "lostPetID" SERIAL PRIMARY KEY,
  "clientID" integer NOT NULL,
  "petName" varchar(100) NOT NULL,
  "breed" varchar(100) DEFAULT NULL,
  "age" integer DEFAULT NULL,
  "type" varchar(50) DEFAULT NULL,
  "imageURL" varchar(255) DEFAULT NULL,
  "dateLost" date DEFAULT NULL,
  "location" varchar(255) DEFAULT NULL,
  "description" text,
  "datePosted" timestamp DEFAULT CURRENT_TIMESTAMP,
  "categorieID" integer DEFAULT NULL,
  FOREIGN KEY ("clientID") REFERENCES "client" ("clientID") ON DELETE CASCADE,
  FOREIGN KEY ("categorieID") REFERENCES "categorie" ("categorieID") ON DELETE SET NULL
);

-- Insertion des catégories et des produits
INSERT INTO "categorie" ("categorieID", "nom", "description") VALUES
(1, 'Chien', 'Tout pour l''alimentation, la santé et le bien-être de votre chien.'),
(2, 'Chat', 'Large choix de nourritures et accessoires pour chats heureux.'),
(3, 'Oiseau', 'Alimentation adaptée pour oiseaux domestiques et exotiques.');

INSERT INTO "produit" ("produitID", "categorieID", "nom", "description", "prix", "stock", "imageURL", "rating") VALUES
(1, 1, 'POULET, COURGE, MYRTILLE', 'Voilà la recette mono-protéine idéale pour les chiens stérilisés qui veulent retrouver la ligne ! Elle contient 70% de poulet, une viande maigre, peu calorique et riche en protéines pour avoir la pêche, des fruits et des légumes pour faire le plein de vitamines et de fibres, des minéraux et des prébiotiques pour renforcer la santé intestinale. Et roule ma poule !', 49.99, 11, 'chien1.webp', 4),
(2, 1, 'Croquettes Sans Céréales Chien Digestion Sensible Toutes Tailles', 'Nos croquettes fabriquées sans céréales pour chien Digestion Sensible contiennent de l agneau qui est une excellente source de protéines. Elles sont adaptées à tous les chiens, notamment ceux présentant des sensibilités digestives.', 12.50, 150, 'chien2.webp', 3),
(3, 1, 'Croquettes Chien Adulte Toutes Tailles', 'Croquettes complètes et équilibrées pour chiens adultes de toutes tailles. Formulées avec des protéines de qualité et des nutriments essentiels.', 25.99, 80, 'chien3.webp', 5),
(4, 2, 'Croquettes Chat Adulte', 'Croquettes premium pour chats adultes. Riches en protéines et adaptées aux besoins nutritionnels des chats.', 18.75, 120, 'chat1.webp', 4),
(5, 2, 'Pâtée Chat Premium', 'Pâtée de qualité premium pour chats. Texture onctueuse et saveurs variées pour satisfaire les palais les plus exigeants.', 8.99, 200, 'chat2.webp', 5),
(6, 3, 'Graines pour Oiseaux', 'Mélange de graines de qualité pour oiseaux domestiques. Équilibré et nutritif.', 5.50, 300, 'oiseau1.webp', 4);

-- Reset sequences to start after the inserted data
SELECT setval('"categorie_categorieID_seq"', (SELECT MAX("categorieID") FROM "categorie"));
SELECT setval('"produit_produitID_seq"', (SELECT MAX("produitID") FROM "produit"));
