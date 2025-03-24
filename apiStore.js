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
        console.log(text, "return");
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
const cardsArea = document.getElementById('cardsArea');


async function handleAddItem(cantidad,  productName) {


    if (cantidad > 0) {
        const productos = await cargarProductos();
        const productPrecio = productos.find(producto => producto.name === productName).precioXkg;
        const productImg = productos.find(producto => producto.name === productName).img;

        const producto = new productosCart(productName, productPrecio, productImg, cantidad);
        const productosInApi = await cart_api.getAll();
        console.log(productosInApi);

        if(productosInApi.find(product => product.name === productName)){
            console.log(productosInApi.find(product => product.name === productName)._id);

            producto.cantidad += productosInApi.find(product => product.name === productName).cantidad;
            await cart_api.update(productosInApi.find(product => product.name === productName)._id, producto);
            alert("Este item ya estaba en el carrito, se ha actualizado la cantidad");
        }
        else
        {
            await cart_api.create(producto);
        }

        alert(`Se añadieron ${cantidad} unidades al carrito.`);
    } else {
        alert("Por favor, ingrese una cantidad válida.");
    }
}


const cargarProductos = async () => {
    const response = await fetch("productos.json");
    const productos =  await response.json();
    return productos
}

const showProducts = async () => {
    cardsArea.innerHTML = '';
    const productos = await cargarProductos();

    productos.forEach((producto, index) => {
        cardsArea.innerHTML += `
    <div class="card col" id="${producto.name}">
        <div class="d-flex align-items-center mx-auto" style="height: 200px; width: 200px;">
            <img src="${producto.img}" class="card-img-top" alt="user">
        </div>
        <div class="card-body">
            <div style="text-align: center;">
                <label for="laberCantidad" class="form-label">Cantidad:</label>
                <input type="number" id="cantidad" placeholder="0" style="width: 100px;" class="mx-auto mb-3">kg
            </div>
            <button class="btn btn-primary mx-auto d-block addItemCart" >Agregar al carrito</button>
        </div>
    </div>`;
    });
}



document.addEventListener('DOMContentLoaded', showProducts);


// Seleccionar todos los botones de agregar y asignar el evento

document.addEventListener("click", function (event) {

    if (event.target.classList.contains("addItemCart")) {

        const card = event.target.closest(".card");  
        const productName = card.id;  

        // Buscar el input dentro de la misma tarjeta
        const input = card.querySelector("#cantidad");
        const cantidad = parseInt(input.value, 10) || 0;

        handleAddItem(cantidad, productName);
    }
});

