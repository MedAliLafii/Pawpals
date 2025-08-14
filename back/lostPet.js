const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Set up multer for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save images to the 'src/assets/uploads' directory
    cb(null, path.join(__dirname, '..', 'src', 'assets', 'uploads'));  // Fixed path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Add unique timestamp to file names
  }
});

const upload = multer({ storage });

// Middleware to extract clientID from JWT token
function authenticateJWT(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; 
  if (!token) return res.status(403).send('Access denied');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.clientID = decoded.client.clientid; // Changed from clientID to clientid
    next();
  } catch (error) {
    return res.status(401).send('Invalid token');
  }
}

// Route to create a lost pet entry
router.post('/add', authenticateJWT, upload.single('image'), (req, res) => {
  console.log("Received data:", req.body); // Logs form data to the console
  console.log("Received file:", req.file);  // Logs file details to the console

  const { name, breed, age, type, dateLost, location, description } = req.body;
  const imageURL = req.file ? 'uploads/' + req.file.filename : null;  // Save the relative path for the image

  const sql = `INSERT INTO lostpet (clientid, petname, breed, age, type, imageurl, datelost, location, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
req.pool.query(sql, [req.clientID, name, breed, age, type, imageURL, dateLost, location, description], (err, results) => {
  // Continue as normal

    if (err) {
      console.error('Error while adding a lost pet:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Lost pet added successfully' });
  });
});

// Route to retrieve all lost pets with owner details
router.get('/', (req, res) => {
  const sql = `SELECT 
                 lp.lostpetid AS "lostPetID",
                 lp.petname AS "petName",
                 lp.breed,
                 lp.age,
                 lp.type,
                 lp.imageurl AS "imageURL",
                 lp.datelost AS "dateLost",
                 lp.location,
                 lp.description,
                 lp.dateposted AS "datePosted",
                 c.nom AS "ownerName",
                 c.tel AS "ownerPhone",
                 c.email AS "ownerEmail",
                 lp.clientid AS "clientID"
               FROM lostpet lp
               LEFT JOIN client c ON lp.clientid = c.clientid`; // Use LEFT JOIN to handle missing clients

  req.pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error while retrieving lost pets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Retrieved lost pets:', results.rows.length, 'pets found');
    res.status(200).json(results.rows); // Return the list of lost pets along with owner details
  });
});

router.get('/all', (req, res) => {
  const sql = `SELECT 
                 lp.lostpetid AS "lostPetID",
                 lp.petname AS "petName",
                 lp.breed,
                 lp.age,
                 lp.type,
                 lp.imageurl AS "imageURL",
                 lp.datelost AS "dateLost",
                 lp.location,
                 lp.description,
                 lp.dateposted AS "datePosted",
                 c.nom AS "ownerName",
                 c.tel AS "ownerPhone",
                 c.email AS "ownerEmail",
                 lp.clientid AS "clientID"
               FROM lostpet lp
               LEFT JOIN client c ON lp.clientid = c.clientid`; // Use LEFT JOIN to handle missing clients

  req.pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error while retrieving lost pets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Retrieved lost pets:', results.rows.length, 'pets found');
    res.status(200).json(results.rows); // Return the list of lost pets along with owner details
  });
});

router.get('/pets', (req, res) => {
  const { location, types, ages } = req.query;

  let sql = `
    SELECT 
      lp.lostpetid AS "lostPetID",
      lp.petname AS "petName",
      lp.breed,
      lp.age,
      lp.type,
      lp.imageurl AS "imageURL",
      lp.datelost AS "dateLost",
      lp.description,
      lp.dateposted AS "datePosted",
      c.nom AS "ownerName",
      c.tel AS "ownerPhone",
      c.email AS "ownerEmail", 
      lp.location,
      lp.clientid AS "clientID"
         FROM 
       lostpet lp
     INNER JOIN 
       client c ON lp.clientid = c.clientid
    WHERE 1=1
  `;
  const params = [];

  if (location) {
    sql += ` AND lp.location = $1`;
    params.push(location);
  }

  if (types) {
    const typeList = types.split(',');
    sql += ` AND lp.type IN (${typeList.map(() => '$2').join(',')})`;
    params.push(...typeList);
  }

  if (ages) {
    sql += ` AND lp.age < $3`;
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
// Route to delete a lost pet entry
router.delete('/delete/:id', authenticateJWT, (req, res) => {
  const lostPetId = req.params.id;
  const clientID = req.clientID; // Retrieved from the JWT token

  // SQL query to delete the lost pet entry for the authenticated client
  const sql = `DELETE FROM lostpet WHERE lostpetid = $1 AND clientid = $2`;

  req.pool.query(sql, [lostPetId, clientID], (err, results) => {
    if (err) {
      console.error("Error during deletion:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or entry not found" });
    }

    res.status(200).json({ message: "Lost ad deleted successfully" });
  });
});


module.exports = router;
