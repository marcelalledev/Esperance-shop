// ========== DONNÉES DES PRODUITS ==========
const produits = [ /* ... votre tableau existant ... */ ];

// ========== PRODUITS DES VENDEURS ==========
let produitsVendeurs = JSON.parse(localStorage.getItem('produitsVendeurs')) || [];

// ========== MESSAGES ==========
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// ========== UTILISATEURS ==========
let utilisateurs = JSON.parse(localStorage.getItem('utilisateurs')) || [];
let utilisateur = JSON.parse(localStorage.getItem('utilisateur')) || null;

// ========== PANIER ==========
let panier = JSON.parse(localStorage.getItem('panier')) || [];

// ========== FAVORIS ==========
let favoris = JSON.parse(localStorage.getItem('favoris')) || [];

// ========== COMMANDES ==========
let commandes = JSON.parse(localStorage.getItem('commandes')) || [];

// ========== VARIABLES GLOBALES ==========
let slideIndex = 0;
let quantity = 1;

// ========== FONCTIONS UTILISATEURS ==========

function inscrireUtilisateur(event) {
    event.preventDefault();
    const nom = document.getElementById('nom')?.value;
    const email = document.getElementById('email')?.value;
    const telephone = document.getElementById('telephone')?.value;
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const cgu = document.getElementById('cgu')?.checked;
    
    if (!nom || !email || !telephone || !password || !confirmPassword) {
        showNotification("❌ Tous les champs sont obligatoires", "error");
        return false;
    }
    if (password !== confirmPassword) {
        showNotification("❌ Les mots de passe ne correspondent pas", "error");
        return false;
    }
    if (password.length < 6) {
        showNotification("❌ Le mot de passe doit contenir au moins 6 caractères", "error");
        return false;
    }
    if (!cgu) {
        showNotification("❌ Vous devez accepter les conditions générales", "error");
        return false;
    }
    if (utilisateurs.find(u => u.email === email)) {
        showNotification("❌ Cet email est déjà utilisé", "error");
        return false;
    }
    
    const nouvelUtilisateur = {
        id: Date.now(),
        nom: nom,
        email: email,
        telephone: telephone,
        password: password,
        isSeller: false,
        storeName: null,
        storeDescription: null,
        dateInscription: new Date().toISOString(),
        adresse: null,
        ville: null
    };
    
    utilisateurs.push(nouvelUtilisateur);
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    utilisateur = nouvelUtilisateur;
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    
    showNotification("✅ Inscription réussie !");
    setTimeout(() => window.location.href = 'index.html', 1500);
    return false;
}

function connecterUtilisateur(event) {
    event.preventDefault();
    const identifiant = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!identifiant || !password) {
        showNotification("❌ Veuillez remplir tous les champs", "error");
        return false;
    }
    
    const utilisateurTrouve = utilisateurs.find(u => 
        (u.email === identifiant || u.telephone === identifiant) && u.password === password
    );
    
    if (!utilisateurTrouve) {
        showNotification("❌ Email/téléphone ou mot de passe incorrect", "error");
        return false;
    }
    
    utilisateur = utilisateurTrouve;
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    
    showNotification("✅ Connexion réussie !");
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'index.html';
        window.location.href = redirect;
    }, 1500);
    return false;
}

function deconnecterUtilisateur() {
    utilisateur = null;
    localStorage.removeItem('utilisateur');
    showNotification("👋 Déconnexion réussie");
    setTimeout(() => window.location.href = 'index.html', 1000);
}

function mettreAJourProfil(event) {
    event.preventDefault();
    const nom = document.getElementById('nomProfil')?.value;
    const email = document.getElementById('emailProfil')?.value;
    const telephone = document.getElementById('telephoneProfil')?.value;
    const adresse = document.getElementById('adresseProfil')?.value;
    const ville = document.getElementById('villeProfil')?.value;
    
    if (!utilisateur) {
        showNotification("❌ Vous devez être connecté", "error");
        return false;
    }
    
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.email = email || utilisateur.email;
    utilisateur.telephone = telephone || utilisateur.telephone;
    utilisateur.adresse = adresse || utilisateur.adresse;
    utilisateur.ville = ville || utilisateur.ville;
    
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    if (index !== -1) utilisateurs[index] = utilisateur;
    
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    showNotification("✅ Profil mis à jour !");
    return false;
}

function changerMotDePasse(event) {
    event.preventDefault();
    const ancien = document.getElementById('ancienPassword')?.value;
    const nouveau = document.getElementById('nouveauPassword')?.value;
    const confirmer = document.getElementById('confirmerPassword')?.value;
    
    if (!utilisateur) {
        showNotification("❌ Vous devez être connecté", "error");
        return false;
    }
    if (!ancien || !nouveau || !confirmer) {
        showNotification("❌ Tous les champs sont obligatoires", "error");
        return false;
    }
    if (ancien !== utilisateur.password) {
        showNotification("❌ Ancien mot de passe incorrect", "error");
        return false;
    }
    if (nouveau !== confirmer) {
        showNotification("❌ Les nouveaux mots de passe ne correspondent pas", "error");
        return false;
    }
    if (nouveau.length < 6) {
        showNotification("❌ Le nouveau mot de passe doit contenir au moins 6 caractères", "error");
        return false;
    }
    
    utilisateur.password = nouveau;
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    if (index !== -1) utilisateurs[index].password = nouveau;
    
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    showNotification("✅ Mot de passe changé !");
    setTimeout(() => window.location.href = 'profil.html', 1500);
    return false;
}

// ========== FONCTIONS PRODUITS ==========

function formaterPrix(prix) {
    return prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

function genererEtoiles(note) {
    const etoilesPleines = Math.floor(note);
    const demi = note % 1 >= 0.5;
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < etoilesPleines) html += '<i class="fas fa-star"></i>';
        else if (i === etoilesPleines && demi) html += '<i class="fas fa-star-half-alt"></i>';
        else html += '<i class="far fa-star"></i>';
    }
    return html;
}

function voirProduit(id) {
    window.location.href = `produit.html?id=${id}`;
}

function chargerProduitsFlash() {
    const container = document.getElementById('flashProducts');
    if (!container) return;
    const flashDeals = produits.filter(p => p.flashDeal).slice(0, 4);
    if (flashDeals.length === 0) {
        container.innerHTML = '<p>Aucune vente flash pour le moment</p>';
        return;
    }
    container.innerHTML = flashDeals.map(produit => `
        <div class="product-card" onclick="voirProduit(${produit.id})">
            <div class="product-badge">-${produit.reduction}%</div>
            ${produit.livraisonGratuite ? '<div class="product-badge free-shipping">Livraison gratuite</div>' : ''}
            <div class="product-image">
                <img src="${produit.image}" alt="${produit.nom}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.nom}</h3>
                <div class="product-price">
                    <span class="current-price">${formaterPrix(produit.prix)}</span>
                    <span class="old-price">${formaterPrix(produit.ancienPrix)}</span>
                </div>
                <div class="product-rating">
                    ${genererEtoiles(produit.note)} <span>(${produit.avis})</span>
                </div>
                <div class="product-sold">${produit.vendus}+ vendus</div>
                <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${produit.origine}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); ajouterAuPanier(${produit.id})">
                    <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
            </div>
        </div>
    `).join('');
}

function chargerProduitsRecommandes() {
    const container = document.getElementById('recommendedProducts');
    if (!container) return;
    const produitsAffichage = produits.filter(p => !p.flashDeal).slice(0, 8);
    container.innerHTML = produitsAffichage.map(produit => `
        <div class="product-card" onclick="voirProduit(${produit.id})">
            ${produit.reduction ? `<div class="product-badge">-${produit.reduction}%</div>` : ''}
            ${produit.livraisonGratuite ? '<div class="product-badge free-shipping">Livraison gratuite</div>' : ''}
            <div class="product-image">
                <img src="${produit.image}" alt="${produit.nom}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.nom}</h3>
                <div class="product-price">
                    <span class="current-price">${formaterPrix(produit.prix)}</span>
                    ${produit.ancienPrix ? `<span class="old-price">${formaterPrix(produit.ancienPrix)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${genererEtoiles(produit.note)} <span>(${produit.avis})</span>
                </div>
                <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${produit.origine}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); ajouterAuPanier(${produit.id})">
                    <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
            </div>
        </div>
    `).join('');
}

function chargerTousProduits() {
    const container = document.getElementById('catalogueProducts');
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get('categorie');
    const recherche = urlParams.get('search');
    
    let tousProduits = [...produits, ...produitsVendeurs];
    
    if (categorie) {
        tousProduits = tousProduits.filter(p => p.categorie === categorie);
    }
    if (recherche) {
        const searchLower = recherche.toLowerCase();
        tousProduits = tousProduits.filter(p => 
            p.nom.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower) ||
            (p.marque && p.marque.toLowerCase().includes(searchLower))
        );
    }
    afficherProduits(tousProduits);
}

function afficherProduits(produitsAAfficher) {
    const container = document.getElementById('catalogueProducts');
    if (!container) return;
    const resultsCount = document.getElementById('resultsCount');
    
    if (produitsAAfficher.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez d'autres filtres</p>
            </div>
        `;
        if (resultsCount) resultsCount.textContent = '0 produit(s) trouvé(s)';
        return;
    }
    
    container.innerHTML = produitsAAfficher.map(produit => {
        let sellerInfo = '';
        if (produit.sellerId) {
            const vendeur = utilisateurs.find(u => u.id === produit.sellerId);
            if (vendeur) {
                sellerInfo = `<div class="product-seller">Vendeur: ${vendeur.storeName || vendeur.nom}</div>`;
            }
        } else {
            sellerInfo = '<div class="product-seller">Vendu par Espérance Shop</div>';
        }
        return `
        <div class="product-card" onclick="voirProduit(${produit.id})">
            ${produit.reduction ? `<div class="product-badge">-${produit.reduction}%</div>` : ''}
            ${produit.livraisonGratuite ? '<div class="product-badge free-shipping">Livraison gratuite</div>' : ''}
            <div class="product-image">
                <img src="${produit.image}" alt="${produit.nom}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.nom}</h3>
                ${sellerInfo}
                <div class="product-price">
                    <span class="current-price">${formaterPrix(produit.prix)}</span>
                    ${produit.ancienPrix ? `<span class="old-price">${formaterPrix(produit.ancienPrix)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${genererEtoiles(produit.note)} (${produit.avis || 0})
                </div>
                <div class="product-sold">${produit.vendus || 0}+ vendus</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); ajouterAuPanier(${produit.id})">
                    <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
            </div>
        </div>
    `}).join('');
    
    if (resultsCount) resultsCount.textContent = `${produitsAAfficher.length} produit(s) trouvé(s)`;
}

// ========== FILTRES CATALOGUE ==========
function appliquerFiltres() {
    // ... (identique à l'original mais en utilisant tous les produits)
    const catTelephones = document.getElementById('cat-telephones')?.checked || false;
    const catElectronique = document.getElementById('cat-electronique')?.checked || false;
    const catInformatique = document.getElementById('cat-informatique')?.checked || false;
    const catMode = document.getElementById('cat-mode')?.checked || false;
    const catMaison = document.getElementById('cat-maison')?.checked || false;
    const catBeaute = document.getElementById('cat-beaute')?.checked || false;
    const catSports = document.getElementById('cat-sports')?.checked || false;
    const catAuto = document.getElementById('cat-auto')?.checked || false;
    const catBijoux = document.getElementById('cat-bijoux')?.checked || false;
    
    const prixMin = document.getElementById('prix-min')?.value;
    const prixMax = document.getElementById('prix-max')?.value;
    const livraisonGratuite = document.getElementById('livraison-gratuite')?.checked || false;
    const note4 = document.getElementById('note-4')?.checked || false;
    const note3 = document.getElementById('note-3')?.checked || false;
    
    let tousProduits = [...produits, ...produitsVendeurs];
    
    const categoriesSelectionnees = [];
    if (catTelephones) categoriesSelectionnees.push('telephones');
    if (catElectronique) categoriesSelectionnees.push('electronique');
    if (catInformatique) categoriesSelectionnees.push('informatique');
    if (catMode) categoriesSelectionnees.push('mode');
    if (catMaison) categoriesSelectionnees.push('maison');
    if (catBeaute) categoriesSelectionnees.push('beaute');
    if (catSports) categoriesSelectionnees.push('sports');
    if (catAuto) categoriesSelectionnees.push('auto');
    if (catBijoux) categoriesSelectionnees.push('bijoux');
    
    if (categoriesSelectionnees.length > 0) {
        tousProduits = tousProduits.filter(p => categoriesSelectionnees.includes(p.categorie));
    }
    if (prixMin && !isNaN(prixMin) && prixMin !== '') {
        tousProduits = tousProduits.filter(p => p.prix >= parseInt(prixMin));
    }
    if (prixMax && !isNaN(prixMax) && prixMax !== '') {
        tousProduits = tousProduits.filter(p => p.prix <= parseInt(prixMax));
    }
    if (livraisonGratuite) {
        tousProduits = tousProduits.filter(p => p.livraisonGratuite);
    }
    if (note4) {
        tousProduits = tousProduits.filter(p => p.note >= 4);
    } else if (note3) {
        tousProduits = tousProduits.filter(p => p.note >= 3);
    }
    
    afficherProduits(tousProduits);
    showNotification("🔍 Filtres appliqués", "info");
}

function resetFiltres() {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('prix-min').value = '';
    document.getElementById('prix-max').value = '';
    afficherProduits([...produits, ...produitsVendeurs]);
    showNotification("🔄 Filtres réinitialisés", "info");
}

function trierProduits() {
    const tri = document.getElementById('sortSelect')?.value;
    if (!tri || tri === 'default') return;
    let tousProduits = [...produits, ...produitsVendeurs];
    switch(tri) {
        case 'prix-croissant': tousProduits.sort((a, b) => a.prix - b.prix); break;
        case 'prix-decroissant': tousProduits.sort((a, b) => b.prix - a.prix); break;
        case 'note': tousProduits.sort((a, b) => b.note - a.note); break;
        case 'populaires': tousProduits.sort((a, b) => b.vendus - a.vendus); break;
        default: tousProduits.sort((a, b) => a.id - b.id);
    }
    afficherProduits(tousProduits);
    showNotification("📊 Tri appliqué", "info");
}

// ========== CHARGER DÉTAIL PRODUIT ==========
function chargerDetailProduit() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const tousProduits = [...produits, ...produitsVendeurs];
    const produit = tousProduits.find(p => p.id === id);
    if (!produit) {
        window.location.href = 'produits.html';
        return;
    }
    const categoryElement = document.getElementById('productCategory');
    if (categoryElement) categoryElement.textContent = produit.categorie;
    
    let vendeurInfo = '';
    if (produit.sellerId) {
        const vendeur = utilisateurs.find(u => u.id === produit.sellerId);
        if (vendeur) {
            vendeurInfo = `
                <div class="seller-info-box">
                    <h3>Vendeur: ${vendeur.storeName || vendeur.nom}</h3>
                    <p>${vendeur.storeDescription || ''}</p>
                    <button class="btn-primary" onclick="contacterVendeur(${produit.id})">Contacter le vendeur</button>
                </div>
            `;
        }
    }
    
    container.innerHTML = `
        <div class="product-detail">
            <div class="product-gallery">
                <img src="${produit.image}" alt="${produit.nom}" class="main-image" id="mainImage">
                <div class="thumbnail-container">
                    <img src="${produit.image}" alt="Thumbnail" class="thumbnail active" onclick="changerImage('${produit.image}')">
                </div>
            </div>
            
            <div class="product-info">
                <h1>${produit.nom}</h1>
                <div class="product-meta">
                    <span class="product-brand">${produit.marque || 'Generic'}</span>
                    <span>${genererEtoiles(produit.note)} ${produit.note}/5</span>
                    <span>${produit.avis || 0} avis</span>
                    <span>${produit.vendus || 0}+ vendus</span>
                </div>
                <div class="product-price-box">
                    <span class="current-price-big">${formaterPrix(produit.prix)}</span>
                    ${produit.ancienPrix ? `<span class="old-price-big">${formaterPrix(produit.ancienPrix)}</span>` : ''}
                    ${produit.reduction ? `<span class="discount-badge">-${produit.reduction}%</span>` : ''}
                </div>
                <div class="product-stock">
                    <i class="fas ${produit.stock > 0 ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'}"></i>
                    ${produit.stock > 0 ? 'En stock' : 'Rupture de stock'}
                    ${produit.stock > 0 ? `(${produit.stock} disponibles)` : ''}
                </div>
                <div class="quantity-selector">
                    <span>Quantité:</span>
                    <div class="quantity-controls">
                        <button onclick="changerQuantite(-1)" ${produit.stock <= 0 ? 'disabled' : ''}>-</button>
                        <span id="quantity">1</span>
                        <button onclick="changerQuantite(1)" ${produit.stock <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                    <span class="stock-info">${produit.stock || 100} disponibles</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn-large" onclick="ajouterProduitAuPanier(${produit.id})" ${produit.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Ajouter au panier
                    </button>
                    <button class="buy-now-btn" onclick="acheterMaintenant(${produit.id})" ${produit.stock <= 0 ? 'disabled' : ''}>
                        Acheter maintenant
                    </button>
                </div>
                <div class="product-delivery">
                    <i class="fas fa-truck"></i> Livraison: ${produit.livraisonGratuite ? 'Gratuite' : formaterPrix(3000)} - 15-20 jours
                </div>
                <div class="product-guarantee">
                    <i class="fas fa-shield-alt"></i> Garantie: ${produit.garantie || '6 mois'}
                </div>
                <div class="product-description">
                    <h2>Description du produit</h2>
                    <p>${produit.description}</p>
                </div>
                ${vendeurInfo}
            </div>
        </div>
        <div class="reviews-section">
            <h2>Avis clients</h2>
            <!-- Avis existants -->
        </div>
    `;
}

function changerImage(src) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = src;
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === src) thumb.classList.add('active');
        });
    }
}

function changerQuantite(delta) {
    quantity += delta;
    if (quantity < 1) quantity = 1;
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const produit = [...produits, ...produitsVendeurs].find(p => p.id === id);
    if (produit && quantity > produit.stock) quantity = produit.stock;
    const quantityElement = document.getElementById('quantity');
    if (quantityElement) quantityElement.textContent = quantity;
}

// ========== FONCTIONS PANIER ==========
function sauvegarderPanier() {
    localStorage.setItem('panier', JSON.stringify(panier));
    mettreAJourCompteurPanier();
}

function mettreAJourCompteurPanier() {
    const compteurs = document.querySelectorAll('.cart-count');
    const total = panier.reduce((acc, item) => acc + item.quantite, 0);
    compteurs.forEach(compteur => compteur.textContent = total);
}

function ajouterAuPanier(id, quantite = 1) {
    const tousProduits = [...produits, ...produitsVendeurs];
    const produit = tousProduits.find(p => p.id === id);
    if (!produit) return;
    if (produit.stock <= 0) {
        showNotification("❌ Produit en rupture de stock", "error");
        return;
    }
    const existant = panier.find(item => item.id === id);
    if (existant) {
        if (existant.quantite + quantite > produit.stock) {
            showNotification(`❌ Stock insuffisant (${produit.stock} disponibles)`, "error");
            return;
        }
        existant.quantite += quantite;
    } else {
        panier.push({ id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, quantite: quantite });
    }
    sauvegarderPanier();
    showNotification(`✅ ${produit.nom} ajouté au panier !`, "success");
}

function ajouterProduitAuPanier(id) {
    ajouterAuPanier(id, quantity);
}

function supprimerDuPanier(id) {
    panier = panier.filter(item => item.id !== id);
    sauvegarderPanier();
    if (window.location.pathname.includes('panier.html')) afficherPanier();
    showNotification('🗑️ Produit retiré du panier', "info");
}

function modifierQuantite(id, delta) {
    const item = panier.find(i => i.id === id);
    if (item) {
        const tousProduits = [...produits, ...produitsVendeurs];
        const produit = tousProduits.find(p => p.id === id);
        const nouvelleQuantite = item.quantite + delta;
        if (nouvelleQuantite > produit.stock) {
            showNotification(`❌ Stock insuffisant (${produit.stock} disponibles)`, "error");
            return;
        }
        item.quantite = nouvelleQuantite;
        if (item.quantite <= 0) {
            supprimerDuPanier(id);
        } else {
            sauvegarderPanier();
            if (window.location.pathname.includes('panier.html')) afficherPanier();
        }
    }
}

function afficherPanier() {
    const container = document.getElementById('cartContainer');
    if (!container) return;
    if (!panier || panier.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Votre panier est vide</h2>
                <p>Découvrez nos produits</p>
                <a href="produits.html" class="shop-now">Découvrir</a>
            </div>
        `;
        return;
    }
    let sousTotal = 0;
    let fraisLivraison = 3000;
    panier.forEach(item => sousTotal += item.prix * item.quantite);
    if (sousTotal >= 50000) fraisLivraison = 0;
    const total = sousTotal + fraisLivraison;
    
    container.innerHTML = `
        <div class="cart-page">
            <div class="cart-items">
                <h2>Mon panier (${panier.reduce((acc, item) => acc + item.quantite, 0)} articles)</h2>
                <div class="cart-header">
                    <div>Produit</div>
                    <div>Prix unitaire</div>
                    <div>Quantité</div>
                    <div>Total</div>
                    <div></div>
                </div>
                <div id="cartItemsList">
                    ${panier.map(item => `
                        <div class="cart-item" data-id="${item.id}">
                            <div class="cart-product">
                                <img src="${item.image}" alt="${item.nom}" onclick="voirProduit(${item.id})">
                                <div class="cart-product-info">
                                    <h3 onclick="voirProduit(${item.id})">${item.nom}</h3>
                                    <p>${item.sellerId ? 'Vendeur' : 'Importé'}</p>
                                </div>
                            </div>
                            <div class="cart-price">${formaterPrix(item.prix)}</div>
                            <div class="cart-quantity">
                                <button onclick="modifierQuantite(${item.id}, -1)">-</button>
                                <span>${item.quantite}</span>
                                <button onclick="modifierQuantite(${item.id}, 1)">+</button>
                            </div>
                            <div class="cart-total-price">${formaterPrix(item.prix * item.quantite)}</div>
                            <div class="cart-remove" onclick="supprimerDuPanier(${item.id})">
                                <i class="fas fa-trash"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="cart-summary">
                <h2>Récapitulatif</h2>
                <div class="summary-row">
                    <span>Sous-total</span>
                    <span>${formaterPrix(sousTotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Livraison</span>
                    <span>${fraisLivraison === 0 ? 'Gratuite' : formaterPrix(fraisLivraison)}</span>
                </div>
                ${fraisLivraison > 0 ? `<div class="summary-row free-shipping-progress"><span>🎁 Plus que ${formaterPrix(50000 - sousTotal)} pour la livraison gratuite</span></div>` : ''}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${formaterPrix(total)}</span>
                </div>
                
                <div class="payment-options">
                    <h4>Mode de paiement</h4>
                    <select id="paymentMethod" class="payment-select">
                        <option value="livraison">Paiement à la livraison</option>
                        <option value="mtn">Mobile Money MTN</option>
                        <option value="moov">Mobile Money Moov</option>
                        <option value="visa">Carte Visa/Mastercard</option>
                    </select>
                </div>
                
                <button class="checkout-btn" onclick="passerCommande()">Passer la commande</button>
                <a href="produits.html" class="continue-shopping">← Continuer mes achats</a>
            </div>
        </div>
    `;
}

function passerCommande() {
    if (!utilisateur) {
        showModal('connexion', 'Vous devez être connecté pour passer commande');
        return;
    }
    if (!panier || panier.length === 0) {
        showNotification("❌ Votre panier est vide", "error");
        return;
    }
    const paymentMethod = document.getElementById('paymentMethod')?.value || 'livraison';
    const commande = {
        id: Date.now(),
        utilisateurId: utilisateur.id,
        utilisateurNom: utilisateur.nom,
        utilisateurEmail: utilisateur.email,
        utilisateurTelephone: utilisateur.telephone,
        utilisateurAdresse: utilisateur.adresse || 'Non spécifiée',
        utilisateurVille: utilisateur.ville || 'Non spécifiée',
        produits: [...panier],
        sousTotal: panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0),
        fraisLivraison: panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0) >= 50000 ? 0 : 3000,
        total: panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0) + (panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0) >= 50000 ? 0 : 3000),
        paymentMethod: paymentMethod,
        statut: 'En attente',
        date: new Date().toISOString()
    };
    commandes.push(commande);
    localStorage.setItem('commandes', JSON.stringify(commandes));
    panier = [];
    sauvegarderPanier();
    showNotification("✅ Commande passée avec succès !", "success");
    setTimeout(() => window.location.href = 'commandes.html', 2000);
}

function acheterMaintenant(id) {
    ajouterProduitAuPanier(id);
    window.location.href = 'panier.html';
}

// ========== FONCTIONS FAVORIS ==========
function sauvegarderFavoris() {
    localStorage.setItem('favoris', JSON.stringify(favoris));
}

function ajouterAuxFavoris(id) {
    if (!utilisateur) {
        showModal('connexion', 'Connectez-vous pour ajouter aux favoris');
        return false;
    }
    const tousProduits = [...produits, ...produitsVendeurs];
    const produit = tousProduits.find(p => p.id === id);
    if (!produit) return false;
    const existant = favoris.find(f => f.id === id);
    if (!existant) {
        favoris.push({ id: produit.id, nom: produit.nom, prix: produit.prix, image: produit.image, note: produit.note });
        sauvegarderFavoris();
        showNotification("❤️ Ajouté aux favoris", "success");
        chargerFavoris();
        return true;
    } else {
        favoris = favoris.filter(f => f.id !== id);
        sauvegarderFavoris();
        showNotification("💔 Retiré des favoris", "info");
        chargerFavoris();
        return false;
    }
}

function estEnFavori(id) {
    return favoris.some(f => f.id === id);
}

function chargerFavoris() {
    const container = document.getElementById('favorisContainer');
    if (!container) return;
    if (!utilisateur) {
        container.innerHTML = `
            <div class="empty-favoris">
                <i class="fas fa-heart"></i>
                <h2>Connectez-vous pour voir vos favoris</h2>
                <p>Vous devez être connecté pour accéder à votre liste de favoris</p>
                <div class="auth-buttons">
                    <a href="connexion.html" class="btn-primary">Se connecter</a>
                    <a href="inscription.html" class="btn-outline">S'inscrire</a>
                </div>
            </div>
        `;
        return;
    }
    if (!favoris || favoris.length === 0) {
        container.innerHTML = `
            <div class="empty-favoris">
                <i class="fas fa-heart"></i>
                <h2>Vos favoris sont vides</h2>
                <p>Ajoutez des produits à vos favoris</p>
                <a href="produits.html" class="shop-now">Découvrir nos produits</a>
            </div>
        `;
        return;
    }
    container.innerHTML = `
        <div class="favoris-grid">
            ${favoris.map(produit => `
                <div class="favoris-card" onclick="voirProduit(${produit.id})">
                    <img src="${produit.image}" alt="${produit.nom}">
                    <div class="favoris-info">
                        <h3>${produit.nom}</h3>
                        <div class="favoris-price">${formaterPrix(produit.prix)}</div>
                        <div class="favoris-rating">${genererEtoiles(produit.note)}</div>
                        <button class="remove-favoris" onclick="event.stopPropagation(); ajouterAuxFavoris(${produit.id})">
                            <i class="fas fa-trash"></i> Retirer
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== FONCTIONS COMMANDES ==========
function chargerCommandes() {
    const container = document.getElementById('commandesContainer');
    if (!container) return;
    if (!utilisateur) {
        container.innerHTML = `
            <div class="empty-commandes">
                <i class="fas fa-truck"></i>
                <h2>Connectez-vous pour voir vos commandes</h2>
                <div class="auth-buttons">
                    <a href="connexion.html" class="btn-primary">Se connecter</a>
                    <a href="inscription.html" class="btn-outline">S'inscrire</a>
                </div>
            </div>
        `;
        return;
    }
    const commandesUtilisateur = commandes.filter(c => c.utilisateurId === utilisateur.id);
    if (!commandesUtilisateur || commandesUtilisateur.length === 0) {
        container.innerHTML = `
            <div class="empty-commandes">
                <i class="fas fa-truck"></i>
                <h2>Aucune commande pour le moment</h2>
                <a href="produits.html" class="shop-now">Commencer mes achats</a>
            </div>
        `;
        return;
    }
    container.innerHTML = `
        <div class="commandes-list">
            ${commandesUtilisateur.sort((a, b) => new Date(b.date) - new Date(a.date)).map(commande => `
                <div class="commande-card">
                    <div class="commande-header">
                        <div class="commande-info">
                            <span class="commande-numero">Commande #${commande.id}</span>
                            <span class="commande-date">${new Date(commande.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <span class="commande-statut ${commande.statut === 'Livrée' ? 'statut-livre' : 'statut-attente'}">${commande.statut}</span>
                    </div>
                    <div class="commande-body">
                        <div class="commande-produits">
                            ${commande.produits.map(produit => `
                                <div class="commande-produit">
                                    <img src="${produit.image}" alt="${produit.nom}">
                                    <div class="commande-produit-info">
                                        <h4>${produit.nom}</h4>
                                        <p>Quantité: ${produit.quantite} x ${formaterPrix(produit.prix)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="commande-total">
                            <p>Total: ${formaterPrix(commande.total)}</p>
                            <p>Paiement: ${commande.paymentMethod === 'livraison' ? 'À la livraison' : commande.paymentMethod === 'mtn' ? 'MTN Mobile Money' : commande.paymentMethod === 'moov' ? 'Moov Money' : 'Carte bancaire'}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== FONCTIONS VENDEUR ==========
function devenirVendeur(event) {
    event.preventDefault();
    if (!utilisateur) {
        showNotification("❌ Vous devez être connecté", "error");
        return false;
    }
    const storeName = document.getElementById('storeName').value;
    const storeDescription = document.getElementById('storeDescription').value;
    if (!storeName) {
        showNotification("❌ Le nom de la boutique est requis", "error");
        return false;
    }
    utilisateur.isSeller = true;
    utilisateur.storeName = storeName;
    utilisateur.storeDescription = storeDescription || '';
    
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    if (index !== -1) utilisateurs[index] = utilisateur;
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    
    showNotification("✅ Félicitations, vous êtes maintenant vendeur !");
    setTimeout(() => window.location.href = 'vendre.html', 1500);
    return false;
}

function chargerProduitsVendeur() {
    const container = document.getElementById('sellerProducts');
    if (!container) return;
    if (!utilisateur || !utilisateur.isSeller) {
        container.innerHTML = '<p>Vous n\'êtes pas vendeur. <a href="devenir-vendeur.html">Devenir vendeur</a></p>';
        return;
    }
    const mesProduits = produitsVendeurs.filter(p => p.sellerId === utilisateur.id);
    if (mesProduits.length === 0) {
        container.innerHTML = '<p>Vous n\'avez aucun produit. <a href="ajouter-produit.html">Ajouter un produit</a></p>';
        return;
    }
    container.innerHTML = mesProduits.map(produit => `
        <div class="product-card" onclick="voirProduitVendeur(${produit.id})">
            <div class="product-image">
                <img src="${produit.image}" alt="${produit.nom}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.nom}</h3>
                <div class="product-price">
                    <span class="current-price">${formaterPrix(produit.prix)}</span>
                </div>
                <div class="product-stock">Stock: ${produit.stock}</div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); modifierProduitVendeur(${produit.id})">Modifier</button>
                    <button class="add-to-cart-btn" style="background-color: var(--rouge);" onclick="event.stopPropagation(); supprimerProduitVendeur(${produit.id})">Supprimer</button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('totalProduits').textContent = mesProduits.length;
    const stockTotal = mesProduits.reduce((acc, p) => acc + p.stock, 0);
    document.getElementById('stockTotal').textContent = stockTotal;
    const commandesRecues = commandes.filter(cmd => 
        cmd.produits.some(p => mesProduits.some(mp => mp.id === p.id))
    ).length;
    document.getElementById('commandesRecues').textContent = commandesRecues;
}

function voirProduitVendeur(id) {
    window.location.href = `produit.html?id=${id}`;
}

function ajouterProduitVendeur(event) {
    event.preventDefault();
    if (!utilisateur || !utilisateur.isSeller) {
        showNotification("❌ Vous devez être vendeur", "error");
        return false;
    }
    
    const nom = document.getElementById('nomProduit').value;
    const prix = parseInt(document.getElementById('prixProduit').value);
    const description = document.getElementById('descriptionProduit').value;
    const categorie = document.getElementById('categorieProduit').value;
    const stock = parseInt(document.getElementById('stockProduit').value);
    const imageFile = document.getElementById('imageProduit').files[0];
    
    if (!nom || !prix || !description || !categorie || !stock || !imageFile) {
        showNotification("❌ Tous les champs sont obligatoires", "error");
        return false;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = function() {
        const imageBase64 = reader.result;
        const nouveauProduit = {
            id: Date.now(),
            nom: nom,
            prix: prix,
            description: description,
            image: imageBase64,
            categorie: categorie,
            stock: stock,
            sellerId: utilisateur.id,
            dateAjout: new Date().toISOString(),
            vendus: 0,
            note: 0,
            avis: 0
        };
        produitsVendeurs.push(nouveauProduit);
        localStorage.setItem('produitsVendeurs', JSON.stringify(produitsVendeurs));
        showNotification("✅ Produit ajouté avec succès !");
        setTimeout(() => window.location.href = 'vendre.html', 1500);
    };
    return false;
}

function modifierProduitVendeur(id) {
    sessionStorage.setItem('editProductId', id);
    window.location.href = 'modifier-produit.html';
}

function supprimerProduitVendeur(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    produitsVendeurs = produitsVendeurs.filter(p => p.id !== id);
    localStorage.setItem('produitsVendeurs', JSON.stringify(produitsVendeurs));
    chargerProduitsVendeur();
    showNotification("✅ Produit supprimé");
}

function chargerCommandesRecues() {
    const container = document.getElementById('commandesRecuesContainer');
    if (!container) return;
    if (!utilisateur || !utilisateur.isSeller) {
        container.innerHTML = '<p>Vous n\'êtes pas vendeur.</p>';
        return;
    }
    const mesProduitsIds = produitsVendeurs.filter(p => p.sellerId === utilisateur.id).map(p => p.id);
    const commandesRecues = commandes.filter(cmd => 
        cmd.produits.some(p => mesProduitsIds.includes(p.id))
    );
    if (commandesRecues.length === 0) {
        container.innerHTML = '<p>Aucune commande reçue pour le moment.</p>';
        return;
    }
    container.innerHTML = commandesRecues.map(commande => {
        const produitsVendeurDansCommande = commande.produits.filter(p => mesProduitsIds.includes(p.id));
        return `
        <div class="commande-card">
            <div class="commande-header">
                <div class="commande-info">
                    <span class="commande-numero">Commande #${commande.id}</span>
                    <span class="commande-date">${new Date(commande.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <span class="commande-statut ${commande.statut === 'Livrée' ? 'statut-livre' : 'statut-attente'}">${commande.statut}</span>
            </div>
            <div class="commande-body">
                <div class="commande-produits">
                    ${produitsVendeurDansCommande.map(p => `
                        <div class="commande-produit">
                            <img src="${p.image}" alt="${p.nom}">
                            <div class="commande-produit-info">
                                <h4>${p.nom}</h4>
                                <p>Quantité: ${p.quantite} x ${formaterPrix(p.prix)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="commande-total">
                    <p>Client: ${commande.utilisateurNom}</p>
                    <p>Téléphone: ${commande.utilisateurTelephone}</p>
                    <p>Adresse: ${commande.utilisateurAdresse}, ${commande.utilisateurVille}</p>
                </div>
            </div>
        </div>
    `}).join('');
}

// ========== FONCTIONS DE MESSAGERIE ==========
function getConversationId(user1, user2) {
    return [user1, user2].sort().join('_');
}

function envoyerMessage(receiverId, content, productId = null) {
    if (!utilisateur) {
        showNotification("❌ Vous devez être connecté", "error");
        return false;
    }
    if (!content.trim()) {
        showNotification("❌ Message vide", "error");
        return false;
    }
    
    const nouveauMessage = {
        id: Date.now(),
        conversationId: getConversationId(utilisateur.id, receiverId),
        senderId: utilisateur.id,
        receiverId: receiverId,
        content: content,
        productId: productId,
        lu: false,
        timestamp: new Date().toISOString()
    };
    
    messages.push(nouveauMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    if (window.location.pathname.includes('messages.html')) {
        chargerConversation(receiverId);
    }
    
    showNotification("✅ Message envoyé");
    return true;
}

function chargerConversations() {
    const container = document.getElementById('conversationsList');
    if (!container) return;
    if (!utilisateur) {
        container.innerHTML = '<p>Connectez-vous pour voir vos messages.</p>';
        return;
    }
    
    const mesMessages = messages.filter(m => m.senderId === utilisateur.id || m.receiverId === utilisateur.id);
    const conversations = {};
    mesMessages.forEach(m => {
        if (!conversations[m.conversationId]) {
            conversations[m.conversationId] = {
                conversationId: m.conversationId,
                participants: [m.senderId, m.receiverId],
                lastMessage: m,
                unreadCount: 0
            };
        } else {
            if (new Date(m.timestamp) > new Date(conversations[m.conversationId].lastMessage.timestamp)) {
                conversations[m.conversationId].lastMessage = m;
            }
        }
    });
    
    mesMessages.forEach(m => {
        if (m.receiverId === utilisateur.id && !m.lu) {
            if (conversations[m.conversationId]) {
                conversations[m.conversationId].unreadCount++;
            }
        }
    });
    
    const sortedConversations = Object.values(conversations).sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
    
    if (sortedConversations.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">Aucune conversation</p>';
        return;
    }
    
    let html = '';
    sortedConversations.forEach(conv => {
        const otherId = conv.participants.find(id => id !== utilisateur.id);
        const otherUser = utilisateurs.find(u => u.id === otherId) || { nom: 'Utilisateur inconnu', storeName: '' };
        const displayName = otherUser.storeName || otherUser.nom || 'Anonyme';
        const lastMessage = conv.lastMessage.content.length > 30 ? conv.lastMessage.content.substring(0, 30) + '...' : conv.lastMessage.content;
        const time = new Date(conv.lastMessage.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const unreadClass = conv.unreadCount > 0 ? 'unread' : '';
        
        html += `
            <div class="conversation-item ${unreadClass}" onclick="chargerConversation(${otherId})" data-conversation="${conv.conversationId}">
                <div class="conversation-avatar">${displayName.charAt(0).toUpperCase()}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${displayName}</div>
                    <div class="conversation-last-message">${lastMessage}</div>
                </div>
                <div class="conversation-time">${time}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function chargerConversation(otherUserId) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    if (!utilisateur) return;
    
    const otherUser = utilisateurs.find(u => u.id === otherUserId) || { nom: 'Utilisateur inconnu', storeName: '' };
    const displayName = otherUser.storeName || otherUser.nom || 'Anonyme';
    
    messages.forEach(m => {
        if (m.conversationId === getConversationId(utilisateur.id, otherUserId) && m.receiverId === utilisateur.id) {
            m.lu = true;
        }
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    
    const conversationMessages = messages.filter(m => 
        m.conversationId === getConversationId(utilisateur.id, otherUserId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    let messagesHtml = '';
    conversationMessages.forEach(m => {
        const isMine = m.senderId === utilisateur.id;
        const time = new Date(m.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        messagesHtml += `
            <div class="message ${isMine ? 'sent' : 'received'}">
                ${m.content}
                <div class="message-time">${time}</div>
            </div>
        `;
    });
    
    chatArea.innerHTML = `
        <div class="chat-header">
            Conversation avec ${displayName}
        </div>
        <div class="messages-list" id="messagesList">
            ${messagesHtml}
        </div>
        <div class="message-input-area">
            <textarea id="messageContent" placeholder="Écrivez votre message..."></textarea>
            <button onclick="envoyerMessageDepuisChat(${otherUserId})">Envoyer</button>
        </div>
    `;
    
    const messagesList = document.getElementById('messagesList');
    if (messagesList) messagesList.scrollTop = messagesList.scrollHeight;
    
    chargerConversations();
}

function envoyerMessageDepuisChat(receiverId) {
    const content = document.getElementById('messageContent').value;
    if (content) {
        envoyerMessage(receiverId, content);
        document.getElementById('messageContent').value = '';
        setTimeout(() => chargerConversation(receiverId), 100);
    }
}

function contacterVendeur(productId) {
    if (!utilisateur) {
        showModal('connexion', 'Connectez-vous pour contacter le vendeur');
        return;
    }
    const tousProduits = [...produits, ...produitsVendeurs];
    const produit = tousProduits.find(p => p.id === productId);
    if (!produit) return;
    const sellerId = produit.sellerId;
    if (!sellerId) {
        showNotification("Ce produit est vendu par la plateforme, pas de vendeur individuel", "info");
        return;
    }
    window.location.href = `messages.html?user=${sellerId}&product=${productId}`;
}

function mettreAJourBoutique(event) {
    event.preventDefault();
    if (!utilisateur || !utilisateur.isSeller) return false;
    const description = document.getElementById('storeDescription').value;
    utilisateur.storeDescription = description;
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    if (index !== -1) utilisateurs[index] = utilisateur;
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    showNotification("✅ Description mise à jour");
    return false;
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = "success") {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== MODAL ==========
function showModal(type, message) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    if (!modal) return;
    if (type === 'connexion') {
        modalContent.innerHTML = `
            <h3>Connexion requise</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <a href="connexion.html" class="btn-primary">Se connecter</a>
                <a href="inscription.html" class="btn-outline">S'inscrire</a>
                <button onclick="closeModal()" class="btn-secondary">Fermer</button>
            </div>
        `;
    } else if (type === 'confirmation') {
        modalContent.innerHTML = `
            <h3>Confirmation</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <button onclick="closeModal()" class="btn-primary">OK</button>
            </div>
        `;
    }
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

// ========== SLIDER ==========
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (!slides.length) return;
    
    function afficherSlide() {
        const slider = document.getElementById('slider');
        if (slider) slider.style.transform = `translateX(-${slideIndex * 100}%)`;
        dots.forEach((dot, index) => dot.classList.toggle('active', index === slideIndex));
    }
    
    window.changeSlide = function(n) {
        slideIndex += n;
        if (slideIndex >= slides.length) slideIndex = 0;
        if (slideIndex < 0) slideIndex = slides.length - 1;
        afficherSlide();
    };
    
    window.currentSlide = function(n) {
        slideIndex = n;
        afficherSlide();
    };
    
    let interval = setInterval(() => window.changeSlide(1), 5000);
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(interval));
        sliderContainer.addEventListener('mouseleave', () => {
            interval = setInterval(() => window.changeSlide(1), 5000);
        });
    }
}

// ========== TIMER FLASH DEALS ==========
function initTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    let heures = 23, minutes = 59, secondes = 59;
    setInterval(() => {
        if (secondes > 0) secondes--;
        else if (minutes > 0) { minutes--; secondes = 59; }
        else if (heures > 0) { heures--; minutes = 59; secondes = 59; }
        else { heures = 23; minutes = 59; secondes = 59; }
        timerElement.textContent = `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`;
    }, 1000);
}

// ========== RECHERCHE ==========
function initSearch() {
    document.getElementById('searchBtn')?.addEventListener('click', function() {
        const recherche = document.getElementById('searchInput').value;
        if (recherche.trim()) window.location.href = `produits.html?search=${encodeURIComponent(recherche)}`;
    });
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('searchBtn').click();
    });
}

// ========== CONTACT ==========
function envoyerMessage(event) {
    event.preventDefault();
    const nom = document.getElementById('nom')?.value;
    const email = document.getElementById('email')?.value;
    const telephone = document.getElementById('telephone')?.value;
    const sujet = document.getElementById('sujet')?.value;
    const message = document.getElementById('message')?.value;
    if (!nom || !email || !telephone || !sujet || !message) {
        showNotification("❌ Tous les champs sont obligatoires", "error");
        return false;
    }
    showNotification("✅ Message envoyé ! Nous vous répondrons dans les 24h.", "success");
    document.querySelector('form').reset();
    return false;
}

// ========== NEWSLETTER ==========
function inscrireNewsletter(event) {
    event.preventDefault();
    const email = document.querySelector('.newsletter-form input')?.value;
    if (!email) {
        showNotification("❌ Veuillez entrer votre email", "error");
        return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showNotification("❌ Email invalide", "error");
        return false;
    }
    showNotification("✅ Inscription à la newsletter réussie !", "success");
    document.querySelector('.newsletter-form input').value = '';
    return false;
}

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('flashProducts')) chargerProduitsFlash();
    if (document.getElementById('recommendedProducts')) chargerProduitsRecommandes();
    if (document.getElementById('catalogueProducts')) chargerTousProduits();
    if (document.getElementById('productDetailContainer')) chargerDetailProduit();
    if (document.getElementById('cartContainer')) afficherPanier();
    if (document.getElementById('favorisContainer')) chargerFavoris();
    if (document.getElementById('commandesContainer')) chargerCommandes();
    if (document.getElementById('sellerProducts')) chargerProduitsVendeur();
    if (document.getElementById('commandesRecuesContainer')) chargerCommandesRecues();
    if (document.getElementById('conversationsList')) {
        chargerConversations();
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        if (userId) chargerConversation(parseInt(userId));
    }
    
    mettreAJourCompteurPanier();
    initSlider();
    initTimer();
    initSearch();
    
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', inscrireNewsletter);
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) e.stopPropagation();
    });
    
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            if (utilisateur) window.location.href = 'profil.html';
            else window.location.href = 'connexion.html';
        });
    }
    
    const topRight = document.getElementById('topRight');
    if (utilisateur && topRight) {
        let sellerLink = utilisateur.isSeller ? '<a href="vendre.html"><i class="fas fa-store"></i> Vendre</a>' : '<a href="devenir-vendeur.html"><i class="fas fa-store"></i> Devenir vendeur</a>';
        topRight.innerHTML = `
            <a href="contact.html"><i class="fas fa-headset"></i> Aide</a>
            <a href="profil.html"><i class="fas fa-user"></i> ${utilisateur.nom.split(' ')[0]}</a>
            <a href="#" onclick="deconnecterUtilisateur(); return false;"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
            ${sellerLink}
        `;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const tri = urlParams.get('tri');
    if (tri && document.getElementById('sortSelect')) {
        document.getElementById('sortSelect').value = tri;
        trierProduits();
    }
});