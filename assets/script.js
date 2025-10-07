// ===============================
// 🔥 Initialize Firebase
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBSyElf7Kfyt0OMgjOiRJQrbiLjp-blBRk",
  authDomain: "theboutiquefashionhub-c89b5.firebaseapp.com",
  projectId: "theboutiquefashionhub-c89b5",
  storageBucket: "theboutiquefashionhub-c89b5.firebasestorage.app",
  messagingSenderId: "849139458829",
  appId: "1:849139458829:web:b58bc003634729a5a1c644",
  measurementId: "G-DR716P0M3V",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// 🌐 Detect Admin Page
// ===============================
const isAdminPage = window.location.pathname.includes("admin.html");
let selectedCategory = "all";

// ===============================
// 🛍️ Load Products (Realtime)
// ===============================
function loadProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  container.innerHTML = "Loading products...";

  let query = db.collection("products");
  if (selectedCategory !== "all") {
    query = query.where("category", "==", selectedCategory);
  }

  // Realtime listener
  query.orderBy("createdAt", "desc").onSnapshot(
    (snapshot) => {
      container.innerHTML = "";
      if (snapshot.empty) {
        container.innerHTML = "<p>No products found.</p>";
        return;
      }

      snapshot.forEach((doc) => {
        const p = doc.data();
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <h4>${p.name}</h4>
          <p>$${p.price}</p>
          <p>${p.description}</p>
          ${
            isAdminPage
              ? `<button onclick="deleteProduct('${doc.id}')">Delete</button>`
              : ""
          }
        `;
        container.appendChild(div);
      });
    },
    (error) => {
      console.error("Error loading products:", error);
      container.innerHTML = "<p>Error loading products.</p>";
    }
  );
}

// ===============================
// 🧭 Category Filter
// ===============================
document.querySelectorAll("nav a[data-category]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    selectedCategory = btn.getAttribute("data-category");
    loadProducts();
  });
});

// ===============================
// ➕ Add Product (Admin)
// ===============================
const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const category = document.getElementById("category").value.toLowerCase();
    const description = document.getElementById("description").value.trim();
    const file = document.getElementById("image").files[0];

    if (!file) return alert("Please select an image");

    try {
      // Upload to Cloudinary
      const cloudinaryURL = "https://api.cloudinary.com/v1_1/djvqw68em/image/upload";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "theboutiquefashionhub");

      const res = await fetch(cloudinaryURL, { method: "POST", body: formData });
      const data = await res.json();
      const imageUrl = data.secure_url || data.url;

      if (!imageUrl) {
        console.error("Cloudinary error:", data);
        return alert("Image upload failed");
      }

      // Save to Firestore
      await db.collection("products").add({
        name,
        price,
        category,
        description,
        image: imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      alert("✅ Product added successfully!");
      form.reset();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add product. Check console for details.");
    }
  });
}

// ===============================
// ❌ Delete Product (Admin)
// ===============================
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    await db.collection("products").doc(id).delete();
    alert("🗑️ Product deleted!");
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete product.");
  }
}

// ===============================
// ▶️ Start
// ===============================
loadProducts();
