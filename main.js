// ==================== CART ====================
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

// DOM Elements
const cartCountElements = document.querySelectorAll('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist-btn');
const buyNowButtons = document.querySelectorAll('.buy-now-btn');
const cartItemsContainer = document.querySelector('#cart-items-container');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartTotalElement = document.getElementById('cart-total');

// Carousel Elements
const carouselSlides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.carousel-control.prev');
const nextBtn = document.querySelector('.carousel-control.next');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let carouselInterval;

// Initialize
function init() {
    updateCartCount();
    updateWishlistCount();

    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => button.addEventListener('click', handleAddToCart));
    }

    if (addToWishlistButtons.length > 0) {
        addToWishlistButtons.forEach(button => button.addEventListener('click', handleAddToWishlist));
    }

    if (buyNowButtons.length > 0) {
        buyNowButtons.forEach(button => button.addEventListener('click', handleBuyNow));
    }

    if (cartItemsContainer) {
        renderCartItems();
    }

    if (carouselSlides.length > 0) {
        initCarousel();
    }
}

// ---- Extract product info from card ----
function getProductFromCard(card) {
    const id = card.dataset.id;
    const name = card.querySelector('h3').innerText;
    const priceText = card.querySelector('.price').innerText;
    const price = parseFloat(priceText.replace('$', '').replace(',', ''));
    const imageDiv = card.querySelector('.product-image');
    const style = window.getComputedStyle(imageDiv);
    const image = style.backgroundImage.slice(4, -1).replace(/"/g, '');
    return { id, name, price, image };
}

// ---- Add to Cart ----
function handleAddToCart(e) {
    const card = e.target.closest('.product-card');
    const item = getProductFromCard(card);
    addItemToCart(item);

    const btn = e.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    btn.style.backgroundColor = '#2e8b57';
    btn.style.color = 'white';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 2000);
}

function addItemToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveCart();
    updateCartCount();
}

// ---- Buy Now ----
function handleBuyNow(e) {
    const card = e.target.closest('.product-card');
    const item = getProductFromCard(card);
    addItemToCart(item);
    window.location.href = 'cart.html';
}

// ---- Remove from Cart ----
function removeItemFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    if (cartItemsContainer) renderCartItems();
}

// ---- Update Quantity ----
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItemFromCart(id);
        } else {
            saveCart();
            updateCartCount();
            if (cartItemsContainer) renderCartItems();
        }
    }
}

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.innerText = totalItems;
        el.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

// ---- Render Cart Page ----
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Your selection is currently empty. <a href="products.html" style="color:#2e8b57;">Shop now</a></p>';
        updateTotals(0);
        return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItemFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');

    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    if (cartSubtotalElement && cartTotalElement) {
        const formattedTotal = `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        cartSubtotalElement.innerText = formattedTotal;
        cartTotalElement.innerText = formattedTotal;
    }
}

// ==================== WISHLIST ====================
function handleAddToWishlist(e) {
    const card = e.target.closest('.product-card');
    const item = getProductFromCard(card);
    let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];

    const exists = wishlist.find(i => i.id === item.id);
    if (exists) {
        const btn = e.target.closest('button');
        btn.innerHTML = '<i class="fas fa-heart"></i> Already Saved';
        setTimeout(() => {
            btn.innerHTML = '<i class="far fa-heart"></i> Wishlist';
        }, 2000);
        return;
    }

    wishlist.push(item);
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();

    const btn = e.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-heart"></i> Saved!';
    btn.style.color = '#d4246a';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.color = '';
    }, 2000);
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
    const wishlistCountEls = document.querySelectorAll('.wishlist-count');
    wishlistCountEls.forEach(el => {
        el.innerText = wishlist.length;
        el.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
    });
}

// ==================== CAROUSEL ====================
function initCarousel() {
    startCarousel();

    if (prevBtn) prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        resetCarouselInterval();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        resetCarouselInterval();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            showSlide(index);
            resetCarouselInterval();
        });
    });
}

function showSlide(n) {
    carouselSlides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = (n + carouselSlides.length) % carouselSlides.length;

    carouselSlides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function startCarousel() {
    carouselInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
}

function resetCarouselInterval() {
    clearInterval(carouselInterval);
    startCarousel();
}

// Run setup on load
document.addEventListener('DOMContentLoaded', init);
