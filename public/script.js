let OrderHTML = '';
let ORDERS = [];

// Cargar la plantilla de HTML
fetch('order.html')
    .then(response => response.text())
    .then(data => {
        OrderHTML = data;
        loadOrders(); // Cargar las órdenes del servidor al inicio
    })
    .catch(error => console.error('Error al cargar la plantilla:', error));

// Clase Order
class Order {
    constructor(cantity) {
        this.cantity = cantity;
        this.id = ORDERS.length > 0 ? ORDERS[ORDERS.length - 1].id + 1 : 0;
        this.date = new Date();

        this.frame = document.createElement("div");
        this.frame.className = "order";
        this.frame.innerHTML = OrderHTML;
        this.init();
        document.getElementById("activity").appendChild(this.frame);
    }

    init() {
        this.frame.querySelector("#OrderORDERS").textContent = `Pedidos: ${this.cantity}`;
        this.frame.querySelector("#ordergains").textContent = `Ganancias: ${this.cantity * 500}`;
        this.frame.querySelector("#orderid").textContent = `ID: ${this.id}`;
        this.frame.querySelector("#orderday").textContent = `Día: ${this.date.toLocaleDateString()}`;
        this.frame.querySelector('#orderhour').textContent = `Hora: ${this.date.toLocaleTimeString()}`;
        this.frame.querySelector('.delete').addEventListener('click', () => this.delete());
    }

    delete() {
        let confirmd = confirm("Deseas eliminar este pedido?")
        if (confirmd) {
            fetch(`/orders/${this.id}`, { method: 'DELETE' })
            .then(() => {
                this.frame.remove();
                ORDERS = ORDERS.filter(order => order.id !== this.id);
            })
            .catch(error => console.error('Error al eliminar la orden:', error));
        }
    }
}

// Cargar órdenes del servidor
function loadOrders() {
    fetch('/orders')
        .then(response => response.json())
        .then(data => {
            ORDERS = data;
            ORDERS.forEach(orderData => {
                const order = new Order(orderData.cantity);
                order.id = orderData.id;
                order.date = new Date(orderData.date);
                order.init();  // Inicializa correctamente cada orden con sus datos
            });
        })
        .catch(error => console.error('Error al cargar las órdenes:', error));
}

// Agregar una nueva orden
document.getElementById("addorder").addEventListener("click", () => {
    const cantity = parseInt(prompt("Cantidad de Pedidos (NUMERO):"), 10);
    if (!isNaN(cantity) && cantity > 0) {
        const newOrder = new Order(cantity);
        ORDERS.push(newOrder);

        fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: newOrder.id,
                cantity: newOrder.cantity,
                date: newOrder.date.toISOString() // Asegúrate de enviar la fecha en formato ISO
            })
        })
        .catch(error => console.error('Error al guardar la orden:', error));
    } else {
        alert("Por favor, ingresa un número válido.");
    }
});
