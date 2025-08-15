// Importation des modules nécessaires
const express = require('express');
const clientRoutes = express.Router(); // Création du routeur pour les routes client
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const jwt = require('jsonwebtoken'); // Pour la génération et la vérification des tokens JWT
const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config(); // Loading environment variables

// Configuration of the transporter for sending emails via Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASS
    }
});

// Fonction pour générer un code de vérification aléatoire à 8 chiffres
function generateVerificationCode() {
    return Math.floor(10000000 + Math.random() * 90000000);
}

// Route d'inscription d'un nouveau client
clientRoutes.post('/registerClient', async (req, res) => {
    const pool = req.pool; // Retrieving the database connection
    const { name, email, password, address, tel, region } = req.body; // Data from the request body

    try {
        // Hachage du mot de passe avec bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert the client into the database
        const sql = 'INSERT INTO client (nom, email, motdepasse, adresse, tel, region) VALUES ($1, $2, $3, $4, $5, $6) RETURNING clientid';
        const values = [name, email, hashedPassword, address, tel, region];

        // Execute the query
        pool.query(sql, values, (error, result) => {
            if (error) {
                console.error('Error during client registration: ' + error);
                
                // Check if it's a duplicate email error
                if (error.code === '23505' && error.message.includes('email')) {
                    return res.status(409).json({ error: 'An account with this email already exists.' });
                }
                
                return res.status(500).json({ error: 'An error occurred during your signup' });
            }

            // Création d'un panier associé au client nouvellement inscrit
            const clientid = result.rows[0].clientid;
            pool.query('INSERT INTO panier (clientid) VALUES ($1)', [clientid], (error, result) => {
                if (error) reject(error);
            });

            // Envoi d’un e-mail de bienvenue
            transporter.sendMail({
                from: process.env.JWT_MAIL,
                to: email,
                subject: 'Welcome to PawPals',
                text: 'Thank you for signing up on our website!'
            }, (error, info) => {
                if (error) {
                    console.error('Email sending error', error);
                } else {
                    console.log('Email sent successfully:', info.response);
                }
            });

            // Success response
            return res.status(201).json({ message: 'Client sign up successfull', clientId: clientid });
        });
    } catch (error) {
        console.error('Error during password hashing:', error);
        return res.status(500).json({ error: 'An error occurred while hashing the password.' });
    }
});

// Route de connexion d’un client
clientRoutes.post('/loginClient', async (req, res) => {
    const pool = req.pool;
    const { email, password, rememberme } = req.body;

    try {
        // Search for client by email
        const query = 'SELECT * FROM client WHERE email = $1';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            // Check if the client exists
            if (results.rows.length === 0) {
                return res.status(404).json({ error: 'Account not found. Please check your email or register a new account.' });
            }

            const client = results.rows[0];

            // Compare hashed password
            const passwordMatch = await bcrypt.compare(password, client.motdepasse);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Incorrect password. Please try again.' });
            }

            // Création d’un token JWT
            const expiresIn = rememberme ? '30d' : '1d'; // Durée de validité du token
            const token = jwt.sign({ client: client }, process.env.JWT_SECRET, { expiresIn });

            // Envoi du token dans un cookie sécurisé
            const cookieOptions = {
                httpOnly: true,
                secure: true, // Enable secure for HTTPS
                sameSite: 'none', // Allow cross-site cookies
                maxAge: rememberme ? 30 * 24 * 60 * 60 * 1000 : undefined,
                path: '/'
            };
            
            // Set domain to .vercel.app to allow sharing between subdomains
            if (process.env.NODE_ENV === 'production') {
                cookieOptions.domain = '.vercel.app';
            }
            
            res.cookie('token', token, cookieOptions);

            // Success response - also return token in response body for localStorage fallback
            res.status(200).json({ 
                message: 'Login successful', 
                token: token,
                client: client 
            });
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Route pour mot de passe oublié
clientRoutes.post('/forgotpassword', async (req, res) => {
    const pool = req.pool;
    const { email } = req.body;

    try {
        // Vérifie si l'e-mail existe
        const query = 'SELECT * FROM client WHERE email = $1';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Internal error.' });
            }

            if (results.rows.length === 0) {
                return res.status(404).json({ error: 'Client not found.' });
            }

            // Génère un code de vérification et l'envoie par mail
            const verificationCode = generateVerificationCode();
            transporter.sendMail({
                from: process.env.JWT_MAIL,
                to: email,
                subject: 'Password change request',
                text: `Your verification code is: ${verificationCode}`
            }, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ error: 'Error sending code:' });
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(200).json({ code: verificationCode });
                }
            });
        });
    } catch (error) {
        console.error('Global error', error);
        return res.status(500).json({ error: 'Error during forgot password process.' });
    }
});

// Route pour changer le mot de passe
clientRoutes.post('/changepass', async (req, res) => {
    const pool = req.pool;
    const { email, newPassword } = req.body;

    try {
        // Vérifie si l'utilisateur existe
        const query = 'SELECT * FROM client WHERE email = $1';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Internal error.' });
            }

            if (results.rows.length === 0) {
                return res.status(404).json({ error: 'Client not found.' });
            }

            // Hachage du nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Mise à jour du mot de passe
            const updateQuery = 'UPDATE client SET motdepasse = $1 WHERE email = $2';
            pool.query(updateQuery, [hashedPassword, email], (error, result) => {
                if (error) {
                    console.error('Error updating password', error);
                    return res.status(500).json({ error: 'Error during password change.' });
                }

                // Envoi d’un mail de confirmation
                transporter.sendMail({
                    from: process.env.JWT_MAIL,
                    to: email,
                    subject: 'Your password has been changed',
                    text: 'Your password was successfully changed!'
                }, (error, info) => {
                    if (error) console.error('Error sending email:', error);
                    else console.log('Email sent :', info.response);
                });

                res.status(200).json({ message: 'Password changed successfully' });
            });
        });
    } catch (error) {
        console.error('Global error:', error);
        return res.status(500).json({ error: 'Error during password change.' });
    }
});

// Route pour changer le mot de passe (pour utilisateurs connectés)
clientRoutes.post('/changePassword', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check both cookies and Authorization header
    const { currentPassword, newPassword } = req.body;

    console.log('ChangePassword - Token from cookies:', req.cookies.token);
    console.log('ChangePassword - Token from headers:', req.headers.authorization);
    console.log('ChangePassword - Final token:', token);

    if (!token) {
        console.log('ChangePassword - No token found');
        return res.status(401).json({ error: 'Token required to change password.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log('ChangePassword - Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            console.log('ChangePassword - Token verified successfully:', decoded);
            const clientid = decoded.client.clientid;
            const email = decoded.client.email;

            // Vérifier le mot de passe actuel
            const query = 'SELECT motdepasse FROM client WHERE clientid = $1';
            pool.query(query, [clientid], async (error, results) => {
                if (error) {
                    console.error('Error while searching for client:', error);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (results.rows.length === 0) {
                    return res.status(404).json({ error: 'Client not found.' });
                }

                const currentPassword = results.rows[0].motdepasse;

                // Vérifier si l'ancien mot de passe est correct
                const isCurrentPasswordValid = await bcrypt.compare(oldPassword, currentPassword);
                if (!isCurrentPasswordValid) {
                    return res.status(400).json({ error: 'Current password is incorrect.' });
                }

                // Hacher le nouveau mot de passe
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                // Mise à jour du mot de passe
                const updateQuery = 'UPDATE client SET motdepasse = $1 WHERE clientid = $2';
                pool.query(updateQuery, [hashedPassword, clientid], (error, result) => {
                    if (error) {
                        console.error('Error updating password', error);
                        return res.status(500).json({ error: 'Error during password change.' });
                    }

                    // Send confirmation email
                    transporter.sendMail({
                        from: process.env.JWT_MAIL,
                        to: email,
                        subject: 'Your password has been changed',
                        text: 'Your password was successfully changed!'
                    }, (error, info) => {
                        if (error) console.error('Error sending email:', error);
                        else console.log('Email sent :', info.response);
                    });

                    res.status(200).json({ message: 'Password changed successfully' });
                });
            });
        });
    } catch (error) {
        console.error('Global error:', error);
        return res.status(500).json({ error: 'Error during password change.' });
    }
});

    // Route pour vérifier si le client est authentifié
    clientRoutes.get('/checkAuth', async (req, res) => {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check both cookies and Authorization header

        console.log('CheckAuth - Token from cookies:', req.cookies.token);
        console.log('CheckAuth - Token from headers:', req.headers.authorization);
        console.log('CheckAuth - Final token:', token);

    if (!token) {
        console.log('CheckAuth - No token found');
        return res.status(401).json({ error: 'Aucun token fourni, authentification requise.' });
    }

    try {
        // Vérification du token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('CheckAuth - Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            console.log('CheckAuth - Token verified successfully:', decoded);
            const client = decoded.client;
            res.status(200).json({ message: 'Client authenticated', client });
        });
    } catch (error) {
        console.error('CheckAuth - Verification error:', error);
        return res.status(500).json({ error: 'Error verifying token.' });
    }
});

// Route to verify token from localStorage
clientRoutes.post('/verifyToken', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }
            
            const client = decoded.client;
            res.status(200).json({ message: 'Token verified', client });
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Error verifying token.' });
    }
});

// Route to get fresh client data from database
clientRoutes.get('/getClientData', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token required.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const clientid = decoded.client.clientid;
            const query = 'SELECT nom, region, adresse, tel, email FROM client WHERE clientid = $1';

            pool.query(query, [clientid], (error, results) => {
                if (error) {
                    console.error('Error fetching client data:', error);
                    return res.status(500).json({ error: 'Error fetching client data' });
                }

                if (results.rows.length === 0) {
                    return res.status(404).json({ error: 'Client not found.' });
                }

                res.status(200).json({ client: results.rows[0] });
            });
        });
    } catch (error) {
        console.error('GetClientData - Global error:', error);
        return res.status(500).json({ error: 'Error fetching client data.' });
    }
});

// Route for logout
clientRoutes.post('/logout', async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Enable secure for HTTPS
        sameSite: 'none', // Allow cross-site cookies
        path: '/'
    };
    
    // Set domain to .vercel.app to allow sharing between subdomains
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.domain = '.vercel.app';
    }
    
    res.clearCookie('token', cookieOptions); // Suppression du cookie de session
    res.status(200).json({ message: 'Logout successful' });
});

// Route pour récupérer les infos du client
clientRoutes.get('/getClientInfo', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check both cookies and Authorization header

    console.log('GetClientInfo - Token from cookies:', req.cookies.token);
    console.log('GetClientInfo - Token from headers:', req.headers.authorization);
    console.log('GetClientInfo - Final token:', token);

    if (!token) {
        console.log('GetClientInfo - No token found');
        return res.status(401).json({ error: 'Token required to access this data.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('GetClientInfo - Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            console.log('GetClientInfo - Token verified successfully:', decoded);
            const clientid = decoded.client.clientid;
            const query = 'SELECT nom, region, adresse, tel, email FROM client WHERE clientid = $1';

            pool.query(query, [clientid], (error, results) => {
                if (error) {
                    console.error('Error retrieving data:', error);
                    return res.status(500).json({ error: 'Error retrieving data.' });
                }

                if (results.rows.length === 0) {
                    return res.status(404).json({ error: 'Client not found' });
                }

                res.status(200).json(results.rows[0]);
            });
        });
    } catch (error) {
        console.error('global error :', error);
        return res.status(500).json({ error: 'Verification error' });
    }
});


// Route pour mettre à jour les infos du client
clientRoutes.put('/updateClientInfo', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check both cookies and Authorization header
    const { nom, region, adresse, tel } = req.body;

    console.log('UpdateClientInfo - Request body:', { nom, region, adresse, tel });
    console.log('UpdateClientInfo - Token:', token);

    if (!token) {
        return res.status(401).json({ error: 'Token required for update.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('UpdateClientInfo - Token verification failed:', err);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            console.log('UpdateClientInfo - Full decoded token:', JSON.stringify(decoded, null, 2));
            console.log('UpdateClientInfo - Client object:', JSON.stringify(decoded.client, null, 2));
            console.log('UpdateClientInfo - Token verified, clientid:', decoded.client.clientid);
            const clientid = decoded.client.clientid; // Fixed: clientid -> clientid
            const query = 'UPDATE client SET nom = $1, region = $2, adresse = $3, tel = $4 WHERE clientid = $5';

            console.log('UpdateClientInfo - SQL Query:', query);
            console.log('UpdateClientInfo - Parameters:', [nom, region, adresse, tel, clientid]);

            // First, let's verify the client exists and see current data
            const testQuery = 'SELECT nom, region, adresse, tel FROM client WHERE clientid = $1';
            pool.query(testQuery, [clientid], (testError, testResult) => {
                if (testError) {
                    console.error('Test query error:', testError);
                    return res.status(500).json({ error: 'Error checking client data' });
                }
                
                console.log('Test query result:', testResult.rows);
                
                if (testResult.rows.length === 0) {
                    console.error('Client not found with clientid:', clientid);
                    return res.status(404).json({ error: 'Client not found' });
                }

                // Now proceed with the update
                pool.query(query, [nom, region, adresse, tel, clientid], (error, result) => {
                    if (error) {
                        console.error('Error during update:', error);
                        return res.status(500).json({ error: 'Error during update' });
                    }

                    console.log('Update result:', result);
                    console.log('Rows affected:', result.rowCount);

                    if (result.rowCount === 0) {
                        return res.status(404).json({ error: 'Client not found or no changes made.' });
                    }

                    // Create new JWT token with updated client data
                    const updatedClient = {
                        clientid: clientid,
                        nom: nom,
                        email: decoded.client.email,
                        motdepasse: decoded.client.motdepasse,
                        adresse: adresse,
                        tel: tel,
                        region: region
                    };

                    const newToken = jwt.sign({ client: updatedClient }, process.env.JWT_SECRET, { 
                        expiresIn: '1d' 
                    });

                    // Set the new token in a cookie
                    const cookieOptions = {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 24 * 60 * 60 * 1000, // 1 day
                        path: '/'
                    };
                    
                    if (process.env.NODE_ENV === 'production') {
                        cookieOptions.domain = '.vercel.app';
                    }
                    
                    res.cookie('token', newToken, cookieOptions);

                    res.status(200).json({ 
                        message: 'Update successful.',
                        token: newToken,
                        client: updatedClient
                    });
                });
            });
        });
    } catch (error) {
        console.error('UpdateClientInfo - Global error:', error);
        return res.status(500).json({ error: 'Error during update.' });
    }
});

// Route pour supprimer le compte client
clientRoutes.delete('/account', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Check both cookies and Authorization header

    console.log('DeleteAccount - Token from cookies:', req.cookies.token);
    console.log('DeleteAccount - Token from headers:', req.headers.authorization);
    console.log('DeleteAccount - Final token:', token);

    if (!token) {
        console.log('DeleteAccount - No token found');
        return res.status(401).json({ error: 'Token required to delete account.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('DeleteAccount - Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            console.log('DeleteAccount - Token verified successfully:', decoded);
            const clientid = decoded.client.clientid; // Fixed: clientid -> clientid
            const email = decoded.client.email;

            // First, delete related data (cart items, orders, etc.)
            const deleteQueries = [
                'DELETE FROM panier_produit WHERE panierid IN (SELECT panierid FROM panier WHERE clientid = $1)',
                'DELETE FROM panier WHERE clientid = $1',
                'DELETE FROM commande_produit WHERE commandeID IN (SELECT commandeID FROM commande WHERE clientid = $1)',
                'DELETE FROM commande WHERE clientid = $1',
                'DELETE FROM adoptionpet WHERE clientid = $1',
                'DELETE FROM lostpet WHERE clientid = $1'
            ];

            // Execute delete queries in sequence
            let completedQueries = 0;
            const totalQueries = deleteQueries.length;

            deleteQueries.forEach((query, index) => {
                pool.query(query, [clientid], (error, result) => {
                    if (error) {
                        console.error(`Error deleting related data (query ${index + 1}):`, error);
                    }
                    
                    completedQueries++;
                    
                    // When all related data is deleted, delete the client
                    if (completedQueries === totalQueries) {
                        // Delete the client
                        const deleteClientQuery = 'DELETE FROM client WHERE clientid = $1';
                        pool.query(deleteClientQuery, [clientid], (error, result) => {
                            if (error) {
                                console.error('Error deleting client:', error);
                                return res.status(500).json({ error: 'Error deleting account.' });
                            }

                            if (result.rowCount === 0) {
                                return res.status(404).json({ error: 'Client not found.' });
                            }

                            // Send confirmation email
                            transporter.sendMail({
                                from: process.env.JWT_MAIL,
                                to: email,
                                subject: 'Your PawPals account has been deleted',
                                text: 'Your account has been successfully deleted. We\'re sorry to see you go!'
                            }, (error, info) => {
                                if (error) console.error('Error sending email:', error);
                                else console.log('Account deletion email sent:', info.response);
                            });

                            // Clear the authentication cookie
                            const cookieOptions = {
                                httpOnly: true,
                                secure: true, // Enable secure for HTTPS
                                sameSite: 'none', // Allow cross-site cookies
                                path: '/'
                            };
                            
                            // Set domain to .vercel.app to allow sharing between subdomains
                            if (process.env.NODE_ENV === 'production') {
                                cookieOptions.domain = '.vercel.app';
                            }
                            
                            res.clearCookie('token', cookieOptions);
                            
                            res.status(200).json({ message: 'Account deleted successfully' });
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Global error during account deletion:', error);
        return res.status(500).json({ error: 'Error during account deletion.' });
    }
});

// Exportation du routeur client
module.exports = clientRoutes;
