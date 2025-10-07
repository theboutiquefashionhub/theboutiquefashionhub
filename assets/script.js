// ===============================
// Firebase Config
// ===============================
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyBSyElf7Kfyt0OMgjOiRJQrbiLjp-blBRk",
    authDomain: "theboutiquefashionhub-c89b5.firebaseapp.com",
    projectId: "theboutiquefashionhub-c89b5",
    storageBucket: "theboutiquefashionhub-c89b5.firebasestorage.app",
    messagingSenderId: "849139458829",
    appId: "1:849139458829:web:b58bc003634729a5a1c644",
    measurementId: "G-DR716P0M3V"
  };
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// ===============================
// Detect page
// ===============================
const isAdminPage = location.pathname.includes("admin.html");
const isLoginPage = location.pathname.includes("login.html");

// ===============================
// Login Page
// ===============================
if (isLoginPage) {
  const form = document.getElementById("loginForm");
  const registerLink = document.getElementById("registerLink");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => (location.href = "admin.html"))
      .catch((err) => alert("Login failed: " + err.message));
  });

  registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter new seller email:");
    const password = prompt("Enter password (min 6 chars):");
    if (!email || !password) return;

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => alert("Seller account created!"))
      .catch((err) => alert("Error: " + err.message));
  });
}

// ===============================
// Admin Page (Protected)
// ===============================
if (isAdminPage) {
  auth.onAuthStateChanged((user) => {
    if (!user) location.href = "login.html";
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => auth.signOut());

  const form = document.getElementById("productForm");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("image").files[0];

    if (!file) return alert("Please select an image");

    try {
      // Upload to Cloudinary
      const cloudUrl = "https://api.cloudinary.com/v1_1/djvqw68em/image/upload";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "theboutiquefashionhub");
      const res = await fetch(cloudUrl, { method: "POST", body: fd });
      const data = await res.json();

      await db.collection("products").add({
        name,
        price: parseFloat(price),
        category,
        description,
        image: data.secure_url,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      form.reset();
      loadProducts();
    } catch (err) {
      alert("Error uploading: " + err.message);
    }
  });

  async function loadProducts() {
    const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
    const container = document.getElementById("products");
    container.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.description}</p>
        <p><strong>$${p.price}</strong></p>
        <button onclick="deleteProduct('${doc.id}')">Delete</button>
      `;
      container.appendChild(div);
    });
  }

  window.deleteProduct = async (id) => {
    if (confirm("Delete this product?")) {
      await db.collection("products").doc(id).delete();
      loadProducts();
    }
  };

  loadProducts();
}

// ===============================
// Customer Index Page
// ===============================
if (!isAdminPage && !isLoginPage) {
  const productsDiv = document.getElementById("products");
  async function loadProducts(category = "all") {
    let query = db.collection("products").orderBy("createdAt", "desc");
    if (category !== "all") query = query.where("category", "==", category);
    const snapshot = await query.get();
    productsDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.description}</p>
        <p><strong>$${p.price}</strong></p>
      `;
      productsDiv.appendChild(div);
    });
  }

  document.querySelectorAll("nav a[data-category]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loadProducts(btn.getAttribute("data-category"));
    });
  });

  loadProducts();
}
