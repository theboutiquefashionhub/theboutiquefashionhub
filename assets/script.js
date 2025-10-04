const isAdminPage = window.location.pathname.includes('admin.html');
let selectedCategory = "all";

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

// Admin add product
const form = document.getElementById('productForm');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value.toLowerCase();
    const description = document.getElementById('description').value;
    const image = document.getElementById('imageUrl').value; // use Cloudinary URL

    if(!image) {
      alert('Please upload an image first!');
      return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push({
      id: Date.now(),
      name, 
      price, 
      category, 
      description,
      image
    });

    localStorage.setItem('products', JSON.stringify(products));
    form.reset();
    document.getElementById('imageUrl').value = '';
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

// Initial load
loadProducts();
