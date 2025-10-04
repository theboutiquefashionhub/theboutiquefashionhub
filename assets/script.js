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
const storage = firebase.storage();

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

    const storageRef = storage.ref('uploads/' + file.name);
    storageRef.put(file).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
      db.collection("products").add({ name, price, category, description, image: url }).then(() => {
        form.reset();
        loadProducts();
      });
    });
  });
}

// Delete product
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  db.collection("products").doc(id).delete().then(() => loadProducts());
}

loadProducts();