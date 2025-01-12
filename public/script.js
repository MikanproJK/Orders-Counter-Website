let OrderHTML = '';
let dayhtml = '';

// orders array
let ORDERS = [];
let currentorders = [];

// contenedores de los pedidos
let DaysArray = [];
let WeeksArray = [];

// Cargar la plantilla de HTML
fetch('html/order.html')
    .then(response => response.text())
    .then(data => {
        OrderHTML = data;
        console.log(OrderHTML);
        loadOrders(); // Cargar las órdenes del servidor al inicio
    })
    .catch(error => console.error('Error al cargar la plantilla:', error));

fetch("html/day.html")
    .then(response => response.text())
    .then(data => {
        dayhtml = data;
        console.log("HTML CARGDO", dayhtml);
    })
    .catch(error => console.error('Error al cargar la plantilla:', error))

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
    }

    init() {
        this.frame.querySelector("#OrderORDERS").textContent = `Pedidos: ${this.cantity}`;
        this.frame.querySelector("#ordergains").textContent = `Ganancias: ${this.cantity * 500}`;
        this.frame.querySelector("#orderid").textContent = `ID: ${this.id}`;
        this.frame.querySelector("#orderday").textContent = `Día: ${this.date.toLocaleDateString()}`;
        this.frame.querySelector('#orderhour').textContent = `Hora: ${this.date.toLocaleTimeString()}`;
        this.frame.querySelector('.delete').addEventListener('click', () => this.delete());

        const datedaytosearch = this.date.getDate() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getFullYear();

        if (!DaysArray.includes(datedaytosearch)) {
          DaysArray.push(datedaytosearch);
          newday(this.date.getDate(), this.date.getMonth(), this.date.getFullYear());
        }
        
        document.getElementById(datedaytosearch).appendChild(this.frame);
        console.log("added frame to activity");
    }

    delete() {
        let confirmd = confirm("Deseas eliminar este pedido?")
        if (confirmd) {
            fetch(`/orders/${this.id}`, { method: 'DELETE' })
            .then(() => {
                this.frame.remove();
                ORDERS.splice(this.id, 1);
            })
            .catch(error => console.error('Error al eliminar la orden:', error));
        }
    }
}

function newday(DAY,MONTH,YEAR) {
    const date = new Date();
    const day = date.getDay() || DAY;
    const month = date.getMonth() || MONTH;
    const year = date.getFullYear() || YEAR;
    const id = {DAY,MONTH,YEAR} || date.toISOString().split('T')[0]; 
    const idstring = `${DAY}-${MONTH+1}-${YEAR}`
    console.log(id);
    console.log(`${DAY}-${MONTH+1}-${YEAR}`)

    const frame = document.createElement("div");
    frame.className = "daypestain";
    frame.id = `${DAY}-${MONTH+1}-${YEAR}`
    frame.innerHTML = dayhtml;
    console.log(dayhtml);
    document.querySelector(".weekcontainer").appendChild(frame);
    frame.querySelector(".info_day").textContent = `${DAY}-${MONTH+1}-${YEAR}`

    DaysArray.push(id)
    console.log(DaysArray)
}

// Cargar órdenes del servidor
function loadOrders() {
    fetch('/orders')
        .then(response => response.json())
        .then(data => {
            if (data) {
                ORDERS = data.orders;
                ORDERS.forEach(orderData => {
                    const order = new Order(orderData.cantity);
                    order.id = orderData.id;
                    order.date = new Date(orderData.date);
                    order.init();
                });
                updatevalues();
            } else {
                console.error('Los datos recibidos no contienen un array en "orders".');
            }
        })
        .catch(error => console.error('Error al cargar las órdenes:', error));
}


// Agregar una nueva orden
document.getElementById("addorder").addEventListener("click", () => {
    const cantity = parseInt(prompt("Cantidad de Pedidos (NUMERO):"), 10);
    if (!isNaN(cantity) && cantity > 0) {

        const newOrder = new Order(cantity);
        newOrder.init()
        ORDERS.push(newOrder);
        updatevalues();

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

function updatevalues() {
    let orders = 0
    ORDERS.forEach(orderData => {
        orders += orderData.cantity;
    })
    let gains = orders * 500
    document.getElementById("totalorders").textContent = `Total de Pedidos: ${orders}`;
    document.getElementById("totalgains").textContent = `Total de Ganancias: ${gains}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updatevalues();
    
})
document.addEventListener("click", () => {
    updatevalues();
    if (dayhtml !== '') {
        console.log("DAYHTML CARGADITOOOOOOOOO");
        //newday();
    }
})