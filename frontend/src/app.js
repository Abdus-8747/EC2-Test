// API Base URL - Nginx reverse-proxies /api to backend:5000
const API_BASE = '/api';

// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const statusMeta = document.getElementById('statusMeta');
const itemForm = document.getElementById('itemForm');
const itemInput = document.getElementById('itemInput');
const itemList = document.getElementById('itemList');
const itemCount = document.getElementById('itemCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const alertMessage = document.getElementById('alertMessage');
const refreshBtn = document.getElementById('refreshBtn');

// Helper to display transient alerts
function showAlert(message, type = 'error') {
  alertMessage.className = `alert alert-${type}`;
  alertMessage.textContent = message;
  alertMessage.classList.remove('hidden');

  setTimeout(() => {
    alertMessage.classList.add('hidden');
  }, 4000);
}

// 1. Check System & Database Health
async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.database === 'connected') {
      statusDot.className = 'status-dot connected';
      statusText.textContent = 'Backend & PostgreSQL Connected';
      statusMeta.textContent = `DB Time: ${new Date(data.db_time).toLocaleString()}`;
    } else {
      throw new Error('Database is disconnected');
    }
  } catch (error) {
    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'Connection Error';
    statusMeta.textContent = error.message;
  }
}

// 2. Fetch and Render Items
async function fetchItems() {
  loadingSpinner.classList.remove('hidden');
  itemList.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) throw new Error('Failed to fetch items');
    const items = await res.json();

    itemCount.textContent = items.length;

    if (items.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      renderItems(items);
      itemList.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showAlert('Could not load items from the server.', 'error');
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}

// 3. Render Items to the DOM
function renderItems(items) {
  itemList.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = `item-row ${item.completed ? 'completed' : ''}`;
    li.dataset.id = item.id;

    const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    li.innerHTML = `
      <div class="item-content">
        <input 
          type="checkbox" 
          class="item-checkbox" 
          ${item.completed ? 'checked' : ''} 
          title="Mark complete"
        />
        <div class="item-info">
          <span class="item-title">${escapeHtml(item.title)}</span>
          <span class="item-date">${formattedDate}</span>
        </div>
      </div>
      <button class="btn-delete" title="Delete item">🗑️</button>
    `;

    // Toggle complete listener
    const checkbox = li.querySelector('.item-checkbox');
    checkbox.addEventListener('change', () => toggleItem(item.id, checkbox.checked));

    // Delete item listener
    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    itemList.appendChild(li);
  });
}

// 4. Add a New Item
itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = itemInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error('Failed to create item');

    itemInput.value = '';
    await fetchItems();
    showAlert('Item added successfully!', 'success');
  } catch (error) {
    console.error('Add item error:', error);
    showAlert('Could not add item. Ensure backend and database are running.', 'error');
  }
});

// 5. Toggle Item Completed Status
async function toggleItem(id, completed) {
  try {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Failed to update item');
    await fetchItems();
  } catch (error) {
    console.error('Update item error:', error);
    showAlert('Failed to update item status.', 'error');
  }
}

// 6. Delete an Item
async function deleteItem(id) {
  try {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete item');
    await fetchItems();
    showAlert('Item removed.', 'success');
  } catch (error) {
    console.error('Delete item error:', error);
    showAlert('Failed to delete item.', 'error');
  }
}

// Utility: Prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listeners & Initial Load
refreshBtn.addEventListener('click', () => {
  checkHealth();
  fetchItems();
});

// Bootstrapping
checkHealth();
fetchItems();

// Periodically check health every 15s
setInterval(checkHealth, 15000);

