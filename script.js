const apiUrl = 'https://fakestoreapi.com/products';
const loader = document.getElementById('loader');


const productsContainer = document.getElementById('products-container');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');
const cartItemsList = document.getElementById('cart-items');
const searchInput = document.getElementById('search-input');

let products = [];
const cart = [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) {
        cart.push(...savedCart);
    }
}

// Display cart contents with quantity controls and total
function displayCart() {
    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item) => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
      <span>${item.title}</span>
      <span>
        <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
        ${item.quantity}
        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
      </span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
      <button class="remove-btn" data-id="${item.id}">🗑️</button>
    `;
        cartItemsList.appendChild(cartItem);
    });

    // Show total price
    if (cart.length > 0) {
        const totalItem = document.createElement('li');
        totalItem.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        cartItemsList.appendChild(totalItem);
    }

    // Add event listeners for quantity buttons and remove
    cartItemsList.querySelectorAll('.qty-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            const action = button.getAttribute('data-action');
            updateQuantity(id, action);
        });
    });

    cartItemsList.querySelectorAll('.remove-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

// Update product quantity
function updateQuantity(id, action) {
    const itemIndex = cart.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
        if (action === 'increase') {
            cart[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            cart[itemIndex].quantity -= 1;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        saveCart();
        displayCart();
    }
}

// Remove product from cart
function removeFromCart(id) {
    const productIndex = cart.findIndex((item) => item.id === id);
    if (productIndex !== -1) {
        cart.splice(productIndex, 1);
        saveCart();
        displayCart();
    }
}

// Clear the entire cart
clearCartBtn.addEventListener('click', () => {
    cart.length = 0;
    saveCart();
    displayCart();
});

// Add product to cart
function addToCart(id, title, image, price) {
    const existingProductIndex = cart.findIndex((item) => item.id === id);

    if (existingProductIndex === -1) {
        cart.push({
            id,
            title,
            image,
            price,
            quantity: 1
        });
    } else {
        cart[existingProductIndex].quantity += 1;
    }

    saveCart();
    alert(`${title} added to cart!`);
}

// Display products
function displayProducts(productList) {
    productsContainer.innerHTML = '';

    productList.forEach((product) => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3 class="title">${product.title}</h3>
      <p class="price">$${product.price}</p>
      <button data-id="${product.id}" data-title="${product.title}" data-image="${product.image}" data-price="${product.price}">
        Add to Cart
      </button>
    `;
        productsContainer.appendChild(productElement);
    });
}

// Fetch products
async function fetchProducts() {
    loader.classList.remove('d-none'); // show loader
    productsContainer.innerHTML = ''; // clear container while loading
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
        displayProducts(products); // your existing function
    } catch (error) {
        productsContainer.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
        console.error('Error fetching products:', error);
    } finally {
        loader.classList.add('d-none'); // hide loader
    }
}


// Event delegation for adding to cart
productsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const button = event.target;
        const id = parseInt(button.getAttribute('data-id'));
        const title = button.getAttribute('data-title');
        const image = button.getAttribute('data-image');
        const price = parseFloat(button.getAttribute('data-price'));
        addToCart(id, title, image, price);
    }
});

// Search filter
searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(query)
    );
    displayProducts(filteredProducts);
});

// Open cart modal
cartBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty.');
    } else {
        displayCart();
        cartModal.style.display = 'flex';
    }
});

// Close cart modal
closeCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// Initialize
loadCart();
fetchProducts();