const isAdminPage = window.location.pathname.includes('admin.html');
let selectedCategory = "all";

// Cloudinary config
const CLOUD_NAME = "djvqw68em";
const UPLOAD_PRESET = "theboutiquefashionhub"; 
let uploadedImageUrl = "";

// Load and display products
function loadProducts() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const filtered = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const container = document.getElementById('products');
  if(!container) return;
  container.innerHTML = '';

  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      <p>${p.description}</p>
      ${isAdminPage ? `<button onclick="deleteProduct(${p.id})">Delete</button>` : ''}
    `;
    container.appendChild(div);
  });
}

// Nav buttons
document.querySelectorAll('nav a[data-category]').forEach(btn => {
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    selectedCategory = btn.getAttribute('data-category');
    loadProducts();
  });
});

// Cloudinary upload
if(isAdminPage){
  document.getElementById('uploadBtn').addEventListener('click', async ()=>{
    const file = document.getElementById('image').files[0];
    if(!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      uploadedImageUrl = data.secure_url;
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Image upload failed!");
    }
  });
}

// Admin add product
const form = document.getElementById('productForm');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!uploadedImageUrl) return alert("Please upload an image first.");

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value.toLowerCase();
    const description = document.getElementById('description').value;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push({
      id: Date.now(),
      name, price, category, description,
      image: uploadedImageUrl
    });
    localStorage.setItem('products', JSON.stringify(products));
    form.reset();
    uploadedImageUrl = "";
    loadProducts();
  });
}

// Delete product
function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  let products = JSON.parse(localStorage.getItem('products')) || [];
  products = products.filter(p=>p.id!==id);
  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
}

loadProducts();
