// ---- FIREBASE SETUP ----
const firebaseConfig = {
  apiKey: "AIzaSyBSyElf7Kfyt0OMgjOiRJQrbiLjp-blBRk",
  authDomain: "theboutiquefashionhub-c89b5.firebaseapp.com",
  projectId: "theboutiquefashionhub-c89b5",
  storageBucket: "theboutiquefashionhub-c89b5.appspot.com",
  messagingSenderId: "849139458829",
  appId: "1:849139458829:web:b58bc003634729a5a1c644",
  measurementId: "G-DR716P0M3V"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Detect if on admin page
const isAdminPage = window.location.pathname.includes('admin.html');

// Load products from Firestore
async function loadProducts() {
  const container = document.getElementById('products');
  if (!container) return;
  container.innerHTML = '';

  const snapshot = await db.collection("products").get();
  snapshot.forEach(doc => {
    const p = doc.data();
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      <p>${p.description}</p>
      ${isAdminPage ? `<button onclick="deleteProduct('${doc.id}')">Delete</button>` : ''}
    `;
    container.appendChild(div);
  });
}

// Add new product (Admin only)
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

    // Upload image to Firebase Storage
    const storageRef = storage.ref().child('uploads/' + Date.now() + '-' + file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    // Save product to Firestore
    await db.collection("products").add({
      name,
      price,
      category,
      description,
      image: url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    form.reset();
    loadProducts();
  });
}

// Delete product (Admin only)
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await db.collection("products").doc(id).delete();
  loadProducts();
}

// Initial load
loadProducts();
