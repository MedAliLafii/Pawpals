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
        const sql = 'INSERT INTO client (nom, email, motdepasse, adresse, tel, region) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [name, email, hashedPassword, address, tel, region];

                    // Execute the query
        pool.query(sql, values, (error, result) => {
            if (error) {
                console.error('Error during client registration: ' + error);
                
                // Check if it's a duplicate email error
                if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
                    return res.status(409).json({ error: 'An account with this email already exists.' });
                }
                
                return res.status(500).json({ error: 'An error occurred during your signup' });
            }

            // Création d’un panier associé au client nouvellement inscrit
            pool.query("INSERT INTO panier (clientID) VALUES (?)", [result.insertId], (error, result) => {
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
            return res.status(201).json({ message: 'Client sign up successfull', clientId: result.insertId });
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
        const query = 'SELECT * FROM client WHERE email = ?';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            // Check if the client exists
            if (results.length === 0) {
                return res.status(404).json({ error: 'Account not found. Please check your email or register a new account.' });
            }

            const client = results[0];

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
                secure: process.env.NODE_ENV === 'production', // Secure in production
                sameSite: 'lax', // Protects against CSRF
                maxAge: rememberme ? 30 * 24 * 60 * 60 * 1000 : undefined,
                path: '/'
            };
            
            // Only set domain if it's explicitly configured
            if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
                cookieOptions.domain = process.env.COOKIE_DOMAIN;
            }
            
            console.log('Setting cookie with options:', cookieOptions);
            console.log('NODE_ENV:', process.env.NODE_ENV);
            console.log('COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN);
            
            res.cookie('token', token, cookieOptions);

                    // Success response
        res.status(200).json({ message: 'Login successful', token: token });
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
        const query = 'SELECT * FROM client WHERE email = ?';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Internal error.' });
            }

            if (results.length === 0) {
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
        const query = 'SELECT * FROM client WHERE email = ?';
        pool.query(query, [email], async (error, results) => {
            if (error) {
                console.error('Error while searching for client:', error);
                return res.status(500).json({ error: 'Internal error.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Client not found.' });
            }

            // Hachage du nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Mise à jour du mot de passe
            const updateQuery = 'UPDATE client SET motdepasse = ? WHERE email = ?';
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
    const token = req.cookies.token;
    const { currentPassword, newPassword } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Token required to change password.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const clientID = decoded.client.clientID;
            const email = decoded.client.email;

            // Vérifier le mot de passe actuel
            const query = 'SELECT motdepasse FROM client WHERE clientID = ?';
            pool.query(query, [clientID], async (error, results) => {
                if (error) {
                    console.error('Error while searching for client:', error);
                    return res.status(500).json({ error: 'Internal error.' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Client not found.' });
                }

                // Vérifier si le mot de passe actuel est correct
                const passwordMatch = await bcrypt.compare(currentPassword, results[0].motdepasse);
                if (!passwordMatch) {
                    return res.status(400).json({ error: 'Current password is incorrect.' });
                }

                // Hachage du nouveau mot de passe
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                // Mise à jour du mot de passe
                const updateQuery = 'UPDATE client SET motdepasse = ? WHERE clientID = ?';
                pool.query(updateQuery, [hashedPassword, clientID], (error, result) => {
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
    console.log('Cookies received:', req.cookies);
    console.log('Headers received:', req.headers);
    
    const token = req.cookies.token; // Récupération du token depuis les cookies

    if (!token) {
        console.log('No token found in cookies');
        return res.status(401).json({ error: 'Aucun token fourni, authentification requise.' });
    }

    try {
        // Vérification du token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('Token verification failed:', err.message);
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const client = decoded.client;
            console.log('Token verified successfully for client:', client.clientID);
            res.status(200).json({ message: 'Client authenticated', client });
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Error verifying token.' });
    }
});

// Route for logout
clientRoutes.post('/logout', async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };
    
    // Only set domain if it's explicitly configured
    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
        cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }
    
    res.clearCookie('token', cookieOptions); // Suppression du cookie de session
    res.status(200).json({ message: 'Logout successful' });
});

// Route pour récupérer les infos du client
clientRoutes.get('/getClientInfo', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Token required to access this data.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const clientID = decoded.client.clientID;
            const query = 'SELECT nom, region, adresse, tel, email FROM client WHERE clientID = ?';

            pool.query(query, [clientID], (error, results) => {
                if (error) {
                    console.error('Error retrieving data:', error);
                    return res.status(500).json({ error: 'Error retrieving data.' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Client not found' });
                }

                res.status(200).json(results[0]);
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
    const token = req.cookies.token;
    const { nom, region, adresse, tel } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Token required for update.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const clientID = decoded.client.clientID;
            const query = 'UPDATE client SET nom = ?, region = ?, adresse = ?, tel = ? WHERE clientID = ?';

            pool.query(query, [nom, region, adresse, tel, clientID], (error, result) => {
                if (error) {
                    console.error('Error during update:', error);
                    return res.status(500).json({ error: 'Error during update' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Client not found or no changes made.' });
                }

                res.status(200).json({ message: 'Update successful.' });
            });
        });
    } catch (error) {
        console.error('Global error', error);
        return res.status(500).json({ error: 'Error during update.' });
    }
});

// Route pour supprimer le compte client
clientRoutes.delete('/account', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Token required to delete account.' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }

            const clientID = decoded.client.clientID;
            const email = decoded.client.email;

            // First, delete related data (cart items, orders, etc.)
            const deleteQueries = [
                'DELETE FROM panier_produit WHERE panierID IN (SELECT panierID FROM panier WHERE clientID = ?)',
                'DELETE FROM panier WHERE clientID = ?',
                'DELETE FROM commande_produit WHERE commandeID IN (SELECT commandeID FROM commande WHERE clientID = ?)',
                'DELETE FROM commande WHERE clientID = ?',
                'DELETE FROM adoptionpet WHERE clientID = ?',
                'DELETE FROM lostpet WHERE clientID = ?'
            ];

            // Execute delete queries in sequence
            let completedQueries = 0;
            const totalQueries = deleteQueries.length;

            deleteQueries.forEach((query, index) => {
                pool.query(query, [clientID], (error, result) => {
                    if (error) {
                        console.error(`Error deleting related data (query ${index + 1}):`, error);
                    }
                    
                    completedQueries++;
                    
                    // When all related data is deleted, delete the client
                    if (completedQueries === totalQueries) {
                        // Delete the client
                        const deleteClientQuery = 'DELETE FROM client WHERE clientID = ?';
                        pool.query(deleteClientQuery, [clientID], (error, result) => {
                            if (error) {
                                console.error('Error deleting client:', error);
                                return res.status(500).json({ error: 'Error deleting account.' });
                            }

                            if (result.affectedRows === 0) {
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
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                path: '/'
                            };
                            
                            // Only set domain if it's explicitly configured
                            if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
                                cookieOptions.domain = process.env.COOKIE_DOMAIN;
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
