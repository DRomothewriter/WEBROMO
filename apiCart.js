
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async update(id, data) {
        const response = await fetch(`${this.baseURL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        console.log("Status:", response.status);

        if (!response.ok) {
            throw new Error(`Error al actualizar: ${response.status} ${response.statusText}`);
        }

        // Verifica si hay contenido antes de llamar a .json()
        const text = await response.text();

        if (!text) return {}; // Si está vacío, devuelve un objeto vacío para evitar el error
    }


    async delete(id) {
        await fetch(`${this.baseURL}/${id}`, {
            method: 'DELETE'
        });
    }
}

class productosCart {
    constructor(name, precio, img, cantidad) {
        this.name = name;
        this.precio = precio;
        this.img = img;
        this.cantidad = cantidad;
    }

    getName() {
        return this.name;
    }
    getImg() {
        return this.img;
    }
    getCantidad() {
        return this.cantidad;
    }
    getPrecio() {
        return this.precio;
    }
    setCatidad(cantidad) { 
        this.cantidad = cantidad;
    }
}

const cart_api = new API('https://crudcrud.com/api/63c07177639c46cca285ee51ed6075e9/productosCart');
const Cart = document.getElementById('CartProducts');
const Resumen = document.getElementById('ResumenCompra');

const handleUpdate = async (id, cantidad) => {
    const productosInApi = await cart_api.getAll(); 
    const name = productosInApi.find(producto => producto._id === id).name;
    const precio = productosInApi.find(producto => producto._id === id).precio;
    const img = productosInApi.find(producto => producto._id === id).img;
    

    const data = new productosCart(name, precio, img, cantidad);

    await cart_api.update(id, data);
    showResumen();
    alert('Item updated');
}

const handleDelete = async (id) => {
    if (confirm('Delete this user?')) {
        await cart_api.delete(id);
        alert('Item deleted');
    }

}

const showCart = async () => {
    Cart.innerHTML = '';
    const productosInApi = await cart_api.getAll();
    productosInApi.forEach((producto, index) => {
        Cart.innerHTML += `
            <div class="card mb-3 p-3 itemInCart" id="${producto._id}">
                <h5>${producto.name} <button class="btn btn-danger btn-sm delete ">🗑</button></h5>
                <div class="d-flex justify-content-between">
                    <div>
                        <label>Cantidad:</label>
                        <input type="number" value="${producto.cantidad}" class="form-control d-inline w-auto cantidadCart">
                        <label>Precio:</label>
                        <span class="form-control d-inline w-auto" readonly>${producto.precio}</span> $ m.n.
                    </div>
                    <div class="d-flex align-items-center mx-auto img-fluid" style="height: 200px; width: 200px;">
                    <img src="${producto.img}" alt="${producto.name}" class="img-fluid">
                    </div>
                </div>
                <button class="btn btn-primary w-100 Actualizar" >Actualizar</button>
            </div>`;

    });
}

const showResumen = async () => {
    Resumen.innerHTML = '';
    const productosInApi = await cart_api.getAll();
    let string = "";
    let Total = 30;
    productosInApi.forEach((producto, index) => {
        Total += producto.cantidad * producto.precio;

                string +="<p>"+ producto.name + ': ' + producto.cantidad + ' x ' + producto.precio + '</p> ';
    });
        Resumen.innerHTML += `
            <div class="card p-3">
                <h5>Total de Compra</h5>
                ${string}
                <p>Costo de envío: 30.00</p>
                <p><strong>Monto a pagar: $${Total}.00</strong></p>
                <button class="btn btn-success w-100">Pagar</button>
                <button class="btn btn-danger w-100 mt-2">Cancelar</button>
            </div>`;
}

document.addEventListener('DOMContentLoaded', showCart);
document.addEventListener('DOMContentLoaded', showResumen);

document.addEventListener("click",  (event) => {

    if (event.target.classList.contains("Actualizar")) {

        const card = event.target.closest(".itemInCart");  
        const _id = card.id;  
        // Buscar el input dentro de la misma tarjeta
        const input = card.querySelector(".cantidadCart");
        const cantidad = parseInt(input.value, 10) || 0;
        handleUpdate(_id, cantidad);
    }
});
document.addEventListener("click",  (event) => {

    if (event.target.classList.contains("delete")) {

        const card = event.target.closest(".itemInCart");  
        const _id = card.id;  

        handleDelete(_id);
        document.getElementById(_id).remove();
    }
});