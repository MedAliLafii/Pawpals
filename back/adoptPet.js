const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const blobService = require('./blobService');
require('dotenv').config();

// Set up multer for handling image uploads (memory storage for Vercel Blob)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route to create an adoption pet entry
// Inside the backend POST route

// Middleware to extract clientid from JWT token (if you're using JWT for authentication)
function authenticateJWT(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; 
  if (!token) return res.status(403).send('Access denied');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.clientid = decoded.client.clientid; // Changed from clientid to clientid
    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
}



// Route to create an adoption pet entry
router.post('/add', authenticateJWT, upload.single('image'), async (req, res) => {
  console.log("Received data:", req.body); // Logs form data to the console
  console.log("Received file:", req.file);  // Logs file details to the console

  const { petName, breed, age, type, gender, location, shelter, description, goodWithKids, goodWithOtherPets, houseTrained, specialNeeds } = req.body;
  const goodWithKids2 = goodWithKids ? 1 : 0;
  const goodWithOtherPets2 = goodWithOtherPets ? 1 : 0;
  const houseTrained2= houseTrained ? 1 : 0;
  const specialNeeds2 = specialNeeds ? 1 : 0;

  const clientid = req.clientid;  // Get the clientid from the JWT payload
  let imageURL = null;

  // Handle image upload to Vercel Blob
  if (req.file) {
    try {
      const filename = blobService.generateUniqueFilename(req.file.originalname, 'adoption_');
      const uploadResult = await blobService.uploadFile(
        req.file.buffer, 
        filename, 
        req.file.mimetype
      );

      if (uploadResult.success) {
        imageURL = uploadResult.url;
        console.log('Image uploaded to Vercel Blob:', imageURL);
      } else {
        console.error('Failed to upload image to Vercel Blob:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Error uploading image to Vercel Blob:', error);
      return res.status(500).json({ error: 'Image upload error' });
    }
  }

  const sql = `INSERT INTO adoptionpet 
    (clientid, petname, breed, age, type, gender, imageurl, location, shelter, description, 
    goodwithkids, goodwithotherpets, housetrained, specialneeds)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;

  req.pool.query(sql, [
    clientid, petName, breed, age, type, gender, imageURL, location, shelter, description,
    goodWithKids2, goodWithOtherPets2, houseTrained2, specialNeeds2
  ], (err, results) => {
    if (err) {
      console.error('Error while adding a pet for adoption:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Pet for adoption added successfully' });
  });
});

// Route to delete an adoption pet entry
router.delete('/delete/:id', authenticateJWT, (req, res) => {
  const adoptionId = req.params.id;
  const clientid = req.clientid; // Retrieved from the JWT token

  const sql = `DELETE FROM adoptionpet WHERE adoptionpetid = $1 AND clientid = $2`;

  req.pool.query(sql, [adoptionId, clientid], (err, results) => {
    if (err) {
      console.error("Error during deletion:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or entry not found" });
    }

    res.status(200).json({ message: "Adoption ad deleted successfully" });
  });
});



// Route to get all adoption pets with owner details
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      ap.adoptionpetid, 
      ap.clientid, 
      ap.petname, 
      ap.breed, 
      ap.age, 
      ap.type, 
      ap.gender, 
      ap.imageurl, 
      ap.location, 
      ap.shelter, 
      ap.description, 
      ap.goodwithkids, 
      ap.goodwithotherpets, 
      ap.housetrained, 
      ap.specialneeds, 
      ap.dateposted,
      c.email AS "ownerEmail", 
      c.nom AS "ownerName", 
      c.tel AS "ownerPhone"
    FROM adoptionpet ap
    LEFT JOIN client c ON ap.clientid = c.clientid
  `;

  req.pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error while retrieving adoption pets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results.rows);
  });
});

// Route to get all adoption pets with owner details and filters
router.get('/pets', (req, res) => {
  const { location, types, ages } = req.query;

  let sql = `
    SELECT 
      ap.adoptionpetid,
      ap.clientid, 
      ap.petname, 
      ap.breed, 
      ap.age, 
      ap.type, 
      ap.gender, 
      ap.imageurl, 
      ap.location, 
      ap.shelter, 
      ap.description, 
      ap.goodwithkids, 
      ap.goodwithotherpets, 
      ap.housetrained, 
      ap.specialneeds, 
      ap.dateposted,
      c.email AS "ownerEmail", 
      c.tel AS "ownerPhone"
    FROM 
      adoptionpet ap
    INNER JOIN 
      client c ON ap.clientid = c.clientid
    WHERE 1=1
  `;
  const params = [];

  if (location) {
    sql += ` AND ap.location = $1`;
    params.push(location);
  }

  if (types) {
    const typeList = types.split(',');
    const placeholders = typeList.map((_, index) => `$${params.length + index + 1}`).join(',');
    sql += ` AND ap.type IN (${placeholders})`;
    params.push(...typeList);
  }

  if (ages) {
    sql += ` AND ap.age < $${params.length + 1}`;
    params.push(ages);
  }

  req.pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error while retrieving filtered pets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results.rows);
  });
});

// In your backend Express app
// In your backend Express app
// Route to delete a pet from adoption
router.delete('/delete/:id', authenticateJWT, (req, res) => {
  const petId = req.params.id;
  const clientid = req.clientid; // Extract clientid from the JWT token

  const sql = 'SELECT * FROM adoptionpet WHERE adoptionpetid = $1 AND clientid = $2';
  req.pool.query(sql, [petId, clientid], (err, results) => {
    if (err) {
      console.error('Error checking pet ownership:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.rows.length === 0) {
      return res.status(403).json({ error: 'You can only delete your own pets' });
    }

    const deleteSql = 'DELETE FROM adoptionpet WHERE adoptionpetid = $1';
    req.pool.query(deleteSql, [petId], (err) => {
      if (err) {
        console.error('Error deleting pet:', err);
        return res.status(500).json({ error: 'Failed to delete pet' });
      }
      res.status(200).json({ message: 'Pet deleted successfully' });
    });
  });
});




module.exports = router;
