// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBSyElf7Kfyt0OMgjOiRJQrbiLjp-blBRk",
  authDomain: "theboutiquefashionhub-c89b5.firebaseapp.com",
  projectId: "theboutiquefashionhub-c89b5",
  storageBucket: "theboutiquefashionhub-c89b5.appspot.com",
  messagingSenderId: "849139458829",
  appId: "1:849139458829:web:b58bc003634729a5a1c644",
  measurementId: "G-DR716P0M3V"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Replace with your Cloudinary details
const CLOUD_NAME = "djvqw68em";
const UPLOAD_PRESET = "theboutiquefashionhub"; // unsigned preset you already created

const isAdminPage = window.location.pathname.includes('admin.html');
let selectedCategory = "all";

// Load products
function loadProducts() {
  db.collection("products").get().then(snapshot => {
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = selectedCategory === "all" ? products : products.filter(p => p.category === selectedCategory);
    const container = document.getElementById('products');
    if (!container) return;
    container.innerHTML = '';
    filtered.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
        <p>${p.description}</p>
        ${isAdminPage ? `<button onclick="deleteProduct('${p.id}')">Delete</button>` : ''}
      `;
      container.appendChild(div);
    });
  });
}

// Nav category filter
document.querySelectorAll('nav a[data-category]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    selectedCategory = btn.getAttribute('data-category');
    loadProducts();
  });
});

// Admin add product
const form = document.getElementById('productForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value.toLowerCase();
    const description = document.getElementById('description').value;
    const file = document.getElementById('image').files[0];
    if (!file) return;

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      const imageUrl = data.secure_url;
      return db.collection("products").add({ name, price, category, description, image: imageUrl });
    })
    .then(() => {
      form.reset();
      loadProducts();
    })
    .catch(err => console.error("Upload error:", err));
  });
}

// Delete product
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  db.collection("products").doc(id).delete().then(() => loadProducts());
}

loadProducts();
