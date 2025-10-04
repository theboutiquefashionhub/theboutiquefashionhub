const isAdminPage = window.location.pathname.includes('admin.html');
let selectedCategory = "all";

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

document.querySelectorAll('nav a[data-category]').forEach(btn => {
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    selectedCategory = btn.getAttribute('data-category');
    loadProducts();
  });
});

const form = document.getElementById('productForm');
if(form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value.toLowerCase();
    const description = document.getElementById('description').value;
    const file = document.getElementById('image').files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "theboutiquefashionhub");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/djvqw68em/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      const imageUrl = data.secure_url;

      const products = JSON.parse(localStorage.getItem('products')) || [];
      products.push({
        id: Date.now(),
        name, price, category, description,
        image: imageUrl
      });
      localStorage.setItem('products', JSON.stringify(products));
      form.reset();
      loadProducts();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
    }
  });
}

function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  let products = JSON.parse(localStorage.getItem('products')) || [];
  products = products.filter(p=>p.id!==id);
  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
}

loadProducts();
