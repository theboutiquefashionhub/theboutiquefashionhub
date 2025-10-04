// ---- FIREBASE SETUP ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBSyElf7Kfyt0OMgjOiRJQrbiLjp-blBRk",
  authDomain: "theboutiquefashionhub-c89b5.firebaseapp.com",
  projectId: "theboutiquefashionhub-c89b5",
  storageBucket: "theboutiquefashionhub-c89b5.firebasestorage.app",
  messagingSenderId: "849139458829",
  appId: "1:849139458829:web:b58bc003634729a5a1c644",
  measurementId: "G-DR716P0M3V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- PAGE LOGIC ----
const isAdminPage = window.location.pathname.includes('admin.html');
let selectedCategory = "all";

// Load products from Firestore
async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];
  querySnapshot.forEach(docSnap => products.push({ id: docSnap.id, ...docSnap.data() }));

  const filtered = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

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
}

// Category filter buttons
document.querySelectorAll('nav a[data-category]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    selectedCategory = btn.getAttribute('data-category');
    loadProducts();
  });
});

// Add product (Admin only)
const form = document.getElementById('productForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value.toLowerCase();
    const description = document.getElementById('description').value;
    const file = document.getElementById('image').files[0];
    if (!file) return;

    // Upload image to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "theboutiquefashionhub"); // unsigned preset

    const cloudRes = await fetch("https://api.cloudinary.com/v1_1/djvqw68em/image/upload", {
      method: "POST",
      body: formData
    });
    const cloudData = await cloudRes.json();

    // Save to Firestore
    await addDoc(collection(db, "products"), {
      name,
      price,
      category,
      description,
      image: cloudData.secure_url
    });

    form.reset();
    loadProducts();
  });
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await deleteDoc(doc(db, "products", id));
  loadProducts();
}

// Initial load
loadProducts();
