'use strict';
emailjs.init("o3iEaA1qkVkXXi_xS");


let selectedProduct = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const checkoutModal = document.getElementById('checkout-modal');
const productList = document.getElementById('product-list');
let allProducts = []; // store all product data for reuse
const backTopBtn = document.querySelector('[data-back-top-btn]');
const header = document.querySelector("[data-header]");

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add('active');
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove('active');
  }
});

const updateCartBadge = () => {
  const cartBadge = document.querySelector('.btn-badge');
  if (cartBadge) {
    cartBadge.textContent = cart.length;
  }
};

const refreshCartUI = () => {
  cartItems.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('cart-item'); // Add a class for styling

    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.title;
    nameSpan.classList.add('item-title');

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.classList.add('remove-btn');
    removeBtn.setAttribute('aria-label', `Remove ${item.title}`);
    removeBtn.addEventListener('click', () => {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      refreshCartUI();
    });

    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    cartItems.appendChild(li);
  });
};


const addToCart = (product) => {
  if (!product.inStock) {
    alert(`${product.title} is out of stock.`);
    return;
  }
  if (cart.some((item) => item.title === product.title)) {
    alert(`${product.title} is already in the cart.`);
    return;
  }
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  refreshCartUI();
  alert(`${product.title} added to cart!`);
};

document.querySelector('[aria-label="cart"]').addEventListener('click', () => {
  refreshCartUI();
  cartModal.style.display = 'flex';
});

document.getElementById('close-cart-btn').addEventListener('click', () => {
  cartModal.style.display = 'none';
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  cartModal.style.display = 'none';
  checkoutModal.style.display = 'flex';
});

document.getElementById('close-checkout-btn').addEventListener('click', () => {
  checkoutModal.style.display = 'none';
});

document.getElementById('close-product-detail-btn').addEventListener('click', () => {
  document.getElementById('product-detail-modal').style.display = 'none';
});

document.getElementById('checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const cartDetails = cart.map((item) => `${item.title}`).join('\n');

  const email_templateid = "template_x4q7wds";
  const email_serviceid = "service_cvh11n3";
  const email_pubkey = "o3iEaA1qkVkXXi_xS";

  emailjs.send(email_serviceid, email_templateid, {
    from_name: email,
    message: cartDetails,
  }, email_pubkey).then(() => {
    alert('Yay thank you for adopting! I will get back to you soon :)');
    cart = [];
    localStorage.removeItem('cart');
    updateCartBadge();
    refreshCartUI();
    checkoutModal.style.display = 'none';
  }).catch((error) => {
    console.error('Error sending email:', error);
    alert('Oh noes! Something went wrong. Please try again or let me know pls, thanks :)');
  });
});

document.getElementById('add-to-cart-btn').addEventListener('click', () => {
  if (selectedProduct && selectedProduct.inStock) {
    addToCart(selectedProduct);
  }
});

const renderProducts = (products) => {
  productList.innerHTML = '';

  products.forEach(product => {
    const wrapper = document.createElement('li');
    wrapper.className = 'product-card';
    wrapper.dataset.categories = product.category.join(',');

    const categoryClasses = product.category.map(c => c).join(' ');
    wrapper.classList.add(...product.category);

    const images = product.images.map(img => `<img src="${img}" alt="${product.title}" class="img-cover">`).join('');
    const actions = product.inStock
      ? `<ul class="card-action-list"><li><button class="card-action-btn" aria-label="add to cart"><ion-icon name="add-outline" aria-hidden="true"></ion-icon></button></li></ul>`
      : `<div class="card-badge">Out of Stock</div>`;

    wrapper.innerHTML = `
      <div class="product-card-inner">
        <a href="#" class="card-banner img-holder has-before" style="--width: 300; --height: 300;">
        ${actions}
        <div class="img-cover">${images}</div>
        </a>
        <div class="card-content">
          <h3 class="h3"><a href="#" class="card-title">${product.title}</a></h3>
        </div>
      </div>
    `;

    // Handle product detail modal
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.card-action-btn')) return;
      selectedProduct = product;
      document.getElementById('product-title').textContent = product.title;
      document.getElementById('product-description').textContent = product.description;
      const imageContainer = document.querySelector('.product-images');
      imageContainer.innerHTML = '';
      product.images.forEach(img => {
        const i = document.createElement('img');
        i.src = img;
        i.classList.add('img-cover');
        imageContainer.appendChild(i);
      });
      document.getElementById('add-to-cart-btn').style.display = product.inStock ? 'block' : 'none';
      document.getElementById('product-detail-modal').style.display = 'flex';
    });

    // Handle add to cart from card
    const btn = wrapper.querySelector('.card-action-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
      });
    }

    productList.appendChild(wrapper);
  });
};

const setupFilters = () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active class
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filterBtn;
      if (filter === 'all') {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category.includes(filter));
        renderProducts(filtered);
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  fetch('./assets/data/products.json')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      renderProducts(allProducts);
      setupFilters();
      updateCartBadge();
    })
    .catch(err => console.error('Error loading products:', err));
});