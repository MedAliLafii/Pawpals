-- PostgreSQL Schema for Pawpals
-- Updated with proper column names, sequences, and Vercel Blob integration

-- Create sequences for auto-increment primary keys
CREATE SEQUENCE IF NOT EXISTS client_clientid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS categorie_categorieid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS produit_produitid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS panier_panierid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS commande_commandeid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS adoptionpet_adoptionpetid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS lostpet_lostpetid_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Client table
CREATE TABLE client (
  clientid INTEGER PRIMARY KEY DEFAULT nextval('client_clientid_seq'),
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  motdepasse VARCHAR(100) NOT NULL,
  adresse VARCHAR(255) DEFAULT NULL,
  tel INTEGER DEFAULT NULL,
  region VARCHAR(30) DEFAULT NULL
);

-- Category table
CREATE TABLE categorie (
  categorieid INTEGER PRIMARY KEY DEFAULT nextval('categorie_categorieid_seq'),
  nom VARCHAR(100) NOT NULL,
  description TEXT
);

-- Product table
CREATE TABLE produit (
  produitid INTEGER PRIMARY KEY DEFAULT nextval('produit_produitid_seq'),
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  imageurl VARCHAR(500) DEFAULT NULL, -- Updated for Vercel Blob URLs
  categorieid INTEGER DEFAULT NULL,
  rating INTEGER DEFAULT NULL,
  FOREIGN KEY (categorieid) REFERENCES categorie (categorieid) ON DELETE SET NULL
);

-- Cart table
CREATE TABLE panier (
  panierid INTEGER PRIMARY KEY DEFAULT nextval('panier_panierid_seq'),
  clientid INTEGER NOT NULL,
  FOREIGN KEY (clientid) REFERENCES client (clientid) ON DELETE CASCADE
);

-- Cart product junction table
CREATE TABLE panier_produit (
  panierid INTEGER NOT NULL,
  produitid INTEGER NOT NULL,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  PRIMARY KEY (panierid, produitid),
  FOREIGN KEY (panierid) REFERENCES panier (panierid) ON DELETE CASCADE,
  FOREIGN KEY (produitid) REFERENCES produit (produitid) ON DELETE CASCADE
);

-- Order table
CREATE TABLE commande (
  commandeid INTEGER PRIMARY KEY DEFAULT nextval('commande_commandeid_seq'),
  clientid INTEGER NOT NULL,
  datecommande DATE NOT NULL,
  statut VARCHAR(50) NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  FOREIGN KEY (clientid) REFERENCES client (clientid) ON DELETE CASCADE
);

-- Order product junction table
CREATE TABLE commande_produit (
  commandeid INTEGER NOT NULL,
  produitid INTEGER NOT NULL,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  PRIMARY KEY (commandeid, produitid),
  FOREIGN KEY (commandeid) REFERENCES commande (commandeid) ON DELETE CASCADE,
  FOREIGN KEY (produitid) REFERENCES produit (produitid) ON DELETE CASCADE
);

-- Adoption pet table
CREATE TABLE adoptionpet (
  adoptionpetid INTEGER PRIMARY KEY DEFAULT nextval('adoptionpet_adoptionpetid_seq'),
  clientid INTEGER NOT NULL,
  petname VARCHAR(100) NOT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  type VARCHAR(50) DEFAULT NULL CHECK (type IN ('Dog', 'Cat', 'Bird', 'Other')),
  imageurl VARCHAR(500) DEFAULT NULL, -- Updated for Vercel Blob URLs
  location VARCHAR(255) DEFAULT NULL,
  shelter VARCHAR(100) DEFAULT NULL,
  description TEXT,
  goodwithkids INTEGER DEFAULT 0 CHECK (goodwithkids IN (0, 1)),
  goodwithotherpets INTEGER DEFAULT 0 CHECK (goodwithotherpets IN (0, 1)),
  housetrained INTEGER DEFAULT 0 CHECK (housetrained IN (0, 1)),
  specialneeds INTEGER DEFAULT 0 CHECK (specialneeds IN (0, 1)),
  dateposted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientid) REFERENCES client (clientid) ON DELETE CASCADE
);

-- Lost pet table
CREATE TABLE lostpet (
  lostpetid INTEGER PRIMARY KEY DEFAULT nextval('lostpet_lostpetid_seq'),
  clientid INTEGER NOT NULL,
  petname VARCHAR(100) NOT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  type VARCHAR(50) DEFAULT NULL CHECK (type IN ('Dog', 'Cat', 'Bird', 'Other')),
  imageurl VARCHAR(500) DEFAULT NULL, -- Updated for Vercel Blob URLs
  datelost DATE DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  description TEXT,
  dateposted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientid) REFERENCES client (clientid) ON DELETE CASCADE
);

-- Product reviews table (if needed for future features)
CREATE TABLE IF NOT EXISTS fiche_technique (
  ficheid INTEGER PRIMARY KEY,
  produitid INTEGER NOT NULL,
  clientid INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  commentaire TEXT,
  dateposted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produitid) REFERENCES produit (produitid) ON DELETE CASCADE,
  FOREIGN KEY (clientid) REFERENCES client (clientid) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO categorie (categorieid, nom, description) VALUES
(1, 'Chien', 'Tout pour l''alimentation, la santé et le bien-être de votre chien.'),
(2, 'Chat', 'Large choix de nourritures et accessoires pour chats heureux.'),
(3, 'Oiseau', 'Alimentation adaptée pour oiseaux domestiques et exotiques.');

-- Insert sample products (with Vercel Blob URLs)
INSERT INTO produit (produitid, categorieid, nom, description, prix, stock, imageurl, rating) VALUES
(1, 1, 'POULET, COURGE, MYRTILLE', 'Voilà la recette mono-protéine idéale pour les chiens stérilisés qui veulent retrouver la ligne ! Elle contient 70% de poulet, une viande maigre, peu calorique et riche en protéines pour avoir la pêche, des fruits et des légumes pour faire le plein de vitamines et de fibres, des minéraux et des prébiotiques pour renforcer la santé intestinale. Et roule ma poule !', 49.99, 11, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_chien1_1755241219326_ybrm8vb3pu.webp', 4),
(2, 1, 'Croquettes Sans Céréales Chien Digestion Sensible Toutes Tailles', 'Nos croquettes fabriquées sans céréales pour chien Digestion Sensible contiennent de l agneau qui est une excellente source de protéines. Elles sont adaptées à tous les chiens, notamment ceux présentant des sensibilités digestives.', 12.50, 150, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_chien2_1755241220569_z3gk2vo0tb.webp', 3),
(3, 1, 'Croquettes Chien Adulte Toutes Tailles', 'Croquettes complètes et équilibrées pour chiens adultes de toutes tailles. Formulées avec des protéines de qualité et des nutriments essentiels.', 25.99, 80, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_chien3_1755241214272_ocn63s9wdl.webp', 5),
(4, 2, 'Croquettes Chat Adulte', 'Croquettes premium pour chats adultes. Riches en protéines et adaptées aux besoins nutritionnels des chats.', 18.75, 120, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_chat1_1755241210216_kw43r67z3v.webp', 4),
(5, 2, 'Pâtée Chat Premium', 'Pâtée de qualité premium pour chats. Texture onctueuse et saveurs variées pour satisfaire les palais les plus exigeants.', 8.99, 200, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_chat2_1755241211278_t455dh8e1h.webp', 5),
(6, 3, 'Graines pour Oiseaux', 'Mélange de graines de qualité pour oiseaux domestiques. Équilibré et nutritif.', 5.50, 300, 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/product_oiseau_1755241215310_5s1o2egqpj4.webp', 4);

-- Insert sample adoption pets (with Vercel Blob URLs)
INSERT INTO adoptionpet (adoptionpetid, clientid, petname, breed, age, gender, type, imageurl, location, shelter, description, goodwithkids, goodwithotherpets, housetrained, specialneeds) VALUES
(1, 1, 'Buddy', 'Golden Retriever', 24, 'Male', 'Dog', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/adoption_dog1_1755241222615_7qsipbun9qd.webp', 'Tunis', 'Happy Paws Shelter', 'Buddy is a friendly and energetic Golden Retriever looking for an active family.', 1, 1, 1, 0),
(2, 1, 'Mittens', 'Persian', 12, 'Female', 'Cat', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/adoption_cat2_1755241223171_dox5097tstj.jpg', 'Sousse', 'Cat Care Center', 'Mittens is a gentle Persian cat who loves to cuddle and play.', 1, 0, 1, 0),
(3, 1, 'Polly', 'African Grey', 36, 'Female', 'Bird', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/adoption_parrot1_1755241224729_0z9phvx10s4.jpg', 'Monastir', 'Bird Sanctuary', 'Polly is a smart African Grey parrot who can mimic speech.', 1, 1, 1, 0);

-- Insert sample lost pets (with Vercel Blob URLs)
INSERT INTO lostpet (lostpetid, clientid, petname, breed, age, type, imageurl, datelost, location, description) VALUES
(1, 1, 'Max', 'German Shepherd', 18, 'Dog', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/lost_dog3_1755241231106_hfvd9xs9ca5.jpg', '2024-01-15', 'Tunis', 'Max went missing from our backyard. He is friendly and responds to his name.'),
(2, 1, 'Luna', 'Siamese', 8, 'Cat', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/lost_cat3_1755241225509_7tm6ogh4pct.jpg', '2024-01-10', 'Sousse', 'Luna is a shy Siamese cat who may be hiding. She has a distinctive blue collar.'),
(3, 1, 'Rio', 'Macaw', 24, 'Bird', 'https://0ir44h0kj6aikqqz.public.blob.vercel-storage.com/lost_parrot2_1755241232095_eicso2vzf6t.jpg', '2024-01-12', 'Monastir', 'Rio is a colorful Macaw who flew away from our balcony. He can say "Hello".');

-- Reset sequences to start after the inserted data
SELECT setval('client_clientid_seq', (SELECT MAX(clientid) FROM client));
SELECT setval('categorie_categorieid_seq', (SELECT MAX(categorieid) FROM categorie));
SELECT setval('produit_produitid_seq', (SELECT MAX(produitid) FROM produit));
SELECT setval('adoptionpet_adoptionpetid_seq', (SELECT MAX(adoptionpetid) FROM adoptionpet));
SELECT setval('lostpet_lostpetid_seq', (SELECT MAX(lostpetid) FROM lostpet));

-- Create indexes for better performance
CREATE INDEX idx_produit_categorieid ON produit(categorieid);
CREATE INDEX idx_panier_clientid ON panier(clientid);
CREATE INDEX idx_panier_produit_panierid ON panier_produit(panierid);
CREATE INDEX idx_panier_produit_produitid ON panier_produit(produitid);
CREATE INDEX idx_commande_clientid ON commande(clientid);
CREATE INDEX idx_commande_produit_commandeid ON commande_produit(commandeid);
CREATE INDEX idx_commande_produit_produitid ON commande_produit(produitid);
CREATE INDEX idx_adoptionpet_clientid ON adoptionpet(clientid);
CREATE INDEX idx_adoptionpet_type ON adoptionpet(type);
CREATE INDEX idx_adoptionpet_location ON adoptionpet(location);
CREATE INDEX idx_lostpet_clientid ON lostpet(clientid);
CREATE INDEX idx_lostpet_type ON lostpet(type);
CREATE INDEX idx_lostpet_location ON lostpet(location);
CREATE INDEX idx_lostpet_datelost ON lostpet(datelost);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
