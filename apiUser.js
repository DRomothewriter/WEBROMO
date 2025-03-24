class API {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async getAll() {
        const response = await fetch(this.baseURL);
        return response.json();
    }

    async create(data) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async update(id, data) {
        const response = await fetch(`${this.baseURL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async delete(id) {
        await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
    }
}


//Para abajo si debería cambiar varias cosas
const crud_api = new API('https://crudcrud.com/api/63c07177639c46cca285ee51ed6075e9/users');
const userTableBody = document.getElementById('user-table-body');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');
const userModal = new bootstrap.Modal(document.getElementById('userModal'));
let editingUserId = null;

async function loadUsers() {
    userTableBody.innerHTML = '';
    const users = await crud_api.getAll();

    users.forEach((user, index) => {
        userTableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick='handleEdit("${user._id}")'>Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="handleDelete('${user._id}')">Delete</button>
                </td>
            </tr>`;
    });
}

function toggleModal(title, user = {}) {

    modalTitle.innerText = title;
    userForm.reset();
    document.getElementById('username').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    editingUserId = user._id || null;
    userModal.show();

}

async function handleEdit(id) {
    const users = await crud_api.getAll();
    const user = users.find(user => user._id === id);
    console.log(user)
    if (user) {
        toggleModal('Edit User', user);
    }
}

async function handleDelete(id) {
    if (confirm('Delete this user?')) {
        await crud_api.delete(id);
        loadUsers();
    }
}

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        name: document.getElementById('username').value,
        email: document.getElementById('email').value,
    };

    if (editingUserId) {
        await crud_api.update(editingUserId, user);
    } else {
        await crud_api.create(user);
    }

    userModal.hide();
    loadUsers();
});

document.addEventListener('DOMContentLoaded', loadUsers);
