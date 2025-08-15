// Importation des modules nécessaires
const express = require('express');
const cartRoutes = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables (like JWT secret key)

//Récupérer le panier d'un client 
cartRoutes.get('/', async (req, res) => {
    const pool = req.pool; 
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: "Access denied, missing token." }); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const clientid = decoded.client.clientid; 

        // Vérifie que l'utilisateur accède bien à son propre panier
        if (decoded.client.clientid !== parseInt(clientid)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const cartQuery = `
            SELECT pp.produitid, p.nom, p.prix, pp.quantite,
                   p.imageurl, p.stock, p.rating
            FROM panier_produit pp
            JOIN produit p ON pp.produitid = p.produitid
            JOIN panier pa ON pp.panierid = pa.panierid
            WHERE pa.clientid = $1
        `;

        pool.query(cartQuery, [clientid], (error, results) => {
            if (error) {
                console.error('Error retrieving cart:', error);
                return res.status(500).json({ error: "An error occurred while retrieving the cart." });
            }

            res.json(results.rows);
        });
    } catch (error) {
        console.error('Error retrieving cart:', error);

        // Token error handling
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Token invalid." });
        }

        // Server error
        res.status(500).json({ error: "An error occurred while retrieving the cart." });
    }
});

// Ajouter un produit au panier 
cartRoutes.post('/add', async (req, res) => {
    const pool = req.pool;
    const { produitID, quantite } = req.body; // Récupération des données envoyées dans le corps de la requête
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied, missing token." });
    }

    // Validate input
    if (!produitID || !quantite) {
        return res.status(400).json({ error: "Missing required fields: produitID and quantite" });
    }

    // Ensure produitID is a number
    const numericProduitID = parseInt(produitID);
    if (isNaN(numericProduitID)) {
        return res.status(400).json({ error: "Invalid produitID format" });
    }

    // Ensure quantite is a positive number
    const numericQuantite = parseInt(quantite);
    if (isNaN(numericQuantite) || numericQuantite <= 0) {
        return res.status(400).json({ error: "Invalid quantity format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientid = decoded.client.clientid; // Changed from clientid to clientid (lowercase)

        // Validate clientid
        if (!clientid || clientid === null || clientid === undefined) {
            return res.status(400).json({ error: "Invalid client ID" });
        }

        // Vérifie si le panier existe déjà pour ce client
        const cartRows = await new Promise((resolve, reject) => {
            pool.query('SELECT panierid FROM panier WHERE clientid = $1', [clientid], (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows.rows);
                }
            });
        });

        let panierid;

        // Si le panier n'existe pas, on le crée
        if (cartRows.length === 0) {
            const newCartResult = await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO panier (clientid) VALUES ($1) RETURNING panierid',
                    [clientid],
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.rows[0]);
                        }
                    }
                );
            });
            panierid = newCartResult.panierid;
        } else {
            panierid = cartRows[0].panierid;
        }

        // Vérifie si le produit est déjà présent dans le panier
        const existingProductRows = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT quantite FROM panier_produit WHERE panierid = $1 AND produitid = $2',
                [panierid, numericProduitID],
                (error, rows) => {
                    if (error) reject(error);
                    else resolve(rows.rows);
                }
            );
        });

        if (existingProductRows.length > 0) {
            // Mise à jour de la quantité si le produit est déjà dans le panier
            await new Promise((resolve, reject) => {
                pool.query(
                    'UPDATE panier_produit SET quantite = quantite + $1 WHERE panierid = $2 AND produitid = $3',
                    [numericQuantite, panierid, numericProduitID],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });
        } else {
            // Insertion du produit s'il n'existe pas encore dans le panier
            await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO panier_produit (panierid, produitid, quantite) VALUES ($1, $2, $3)',
                    [panierid, numericProduitID, numericQuantite],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });
        }

        res.status(200).json({ message: "Product added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Token invalid." });
        }

        res.status(500).json({ error: "An error occurred while adding the product to the cart." });
    }
});

//  Mettre à jour la quantité d'un produit
cartRoutes.put('/update', async (req, res) => {
    const pool = req.pool;
    const { produitID, quantite } = req.body;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied, missing token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientid = decoded.client.clientid;

        // Récupération du panierid
        const cartRows = await new Promise((resolve, reject) => {
            pool.query('SELECT panierid FROM panier WHERE clientid = $1', [clientid], (error, rows) => {
                if (error) reject(error);
                else resolve(rows.rows);
            });
        });

        if (cartRows.length === 0) {
            return res.status(404).json({ error: "Cart not found." });
        }

        const panierid = cartRows[0].panierid;

        // Vérification de l'existence du produit dans le panier
        const existingProductRows = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT quantite FROM panier_produit WHERE panierid = $1 AND produitid = $2',
                [panierid, produitID],
                (error, rows) => {
                    if (error) reject(error);
                    else resolve(rows.rows);
                }
            );
        });

        if (existingProductRows.length === 0) {
            return res.status(404).json({ error: "Product not found in cart." });
        }

        // Mise à jour de la quantité
        await new Promise((resolve, reject) => {
            pool.query(
                'UPDATE panier_produit SET quantite = $1 WHERE panierid = $2 AND produitid = $3',
                [quantite, panierid, produitID],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        // Vérification du stock disponible
        const stockQuery = 'SELECT stock FROM produit WHERE produitid = $1';
        const stockRows = await new Promise((resolve, reject) => {
            pool.query(stockQuery, [produitID], (error, rows) => {
                if (error) reject(error);
                else resolve(rows.rows);
            });
        });

        if (stockRows.length > 0 && quantite > stockRows[0].stock) {
            // Si la quantité demandée dépasse le stock, on met à jour avec le stock maximum
            await new Promise((resolve, reject) => {
                pool.query(
                    'UPDATE panier_produit SET quantite = $1 WHERE panierid = $2 AND produitid = $3',
                    [stockRows[0].stock, panierid, produitID],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            res.status(200).json({ 
                message: "Quantity updated to maximum available stock.",
                updatedQuantity: stockRows[0].stock
            });
        } else {
            res.status(200).json({ message: "Quantity updated successfully." });
        }
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ error: "An error occurred while updating the cart." });
    }
});

// Supprimer un produit du panier
cartRoutes.delete('/remove', async (req, res) => {
    const pool = req.pool;
    const { produitID } = req.body;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied, missing token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientid = decoded.client.clientid;

        // Récupération du panierid
        const cartRows = await new Promise((resolve, reject) => {
            pool.query('SELECT panierid FROM panier WHERE clientid = $1', [clientid], (error, rows) => {
                if (error) reject(error);
                else resolve(rows.rows);
            });
        });

        if (cartRows.length === 0) {
            return res.status(404).json({ error: "Cart not found." });
        }

        const panierid = cartRows[0].panierid;

        // Suppression du produit du panier
        await new Promise((resolve, reject) => {
            pool.query(
                'DELETE FROM panier_produit WHERE panierid = $1 AND produitid = $2',
                [panierid, produitID],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        res.status(200).json({ message: "Product removed from cart successfully." });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ error: "An error occurred while removing the product from the cart." });
    }
});

// Passer commande 
cartRoutes.post('/commander', async (req, res) => {
    const pool = req.pool;
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied, missing token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientid = decoded.client.clientid;

        // Récupération du panierid
        const cartRows = await new Promise((resolve, reject) => {
            pool.query('SELECT panierid FROM panier WHERE clientid = $1', [clientid], (error, rows) => {
                if (error) reject(error);
                else resolve(rows.rows);
            });
        });

        if (cartRows.length === 0) {
            return res.status(404).json({ error: "Cart not found." });
        }

        const panierid = cartRows[0].panierid;

        // Récupération des produits du panier
        const cartProducts = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT pp.produitid, pp.quantite FROM panier_produit pp WHERE pp.panierid = $1',
                [panierid],
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results.rows);
                }
            );
        });

        if (cartProducts.length === 0) {
            return res.status(400).json({ error: "Your cart is empty." });
        }

        // Calcul du total de la commande
        const totalCommande = await new Promise((resolve, reject) => {
            pool.query(
                `SELECT SUM(p.prix * pp.quantite) AS total 
                 FROM panier_produit pp 
                 JOIN produit p ON pp.produitid = p.produitid 
                 WHERE pp.panierid = $1`,
                [panierid],
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results.rows[0].total);
                }
            );
        });

        // Insertion de la commande
        const commandeResult = await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO commande (clientid, datecommande, statut, total) VALUES ($1, NOW(), \'En attente\', $2) RETURNING commandeid',
                [clientid, totalCommande],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        const commandeID = commandeResult.rows[0].commandeid;

        // Insertion des produits dans la commande + mise à jour du stock
        for (const item of cartProducts) {
            await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO commande_produit (commandeid, produitid, quantite) VALUES ($1, $2, $3)',
                    [commandeID, item.produitid, item.quantite],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            await new Promise((resolve, reject) => {
                pool.query(
                    'UPDATE produit SET stock = stock - $1 WHERE produitid = $2',
                    [item.quantite, item.produitid],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });
        }

        // Vider le panier
        await new Promise((resolve, reject) => {
            pool.query(
                'DELETE FROM panier_produit WHERE panierid = $1',
                [panierid],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        res.status(200).json({ message: "Your order has been placed successfully", commandeID });
    } catch (error) {
        console.error("Error while placing the order:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Token invalid." });
        }
        res.status(500).json({ error: "An error occurred while placing the order." });
    }
});

module.exports = cartRoutes; // Exportation des routes pour les utiliser ailleurs dans l'application