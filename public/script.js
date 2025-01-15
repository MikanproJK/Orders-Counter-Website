let OrderHTML = '';
let dayhtml = '';
let weekhtml = '';

// orders array
let ORDERS = [];
let currentorders = [];

// contenedores de los pedidos
let DaysArray = [];
let weekArray = [];

let OrdersCharged = false;// unused

let ErrorMessages = [];

date = new Date();

// Cargar la plantilla de HTML
fetch('html/order.html')
    .then(response => response.text())
    .then(data => {
        OrderHTML = data;
        loadOrders(); // Cargar las órdenes del servidor al inicio
    })
    .catch(error => console.error('Error al cargar la plantilla:', error));

fetch("html/day.html")
    .then(response => response.text())
    .then(data => {
        dayhtml = data;
    })
    .catch(error => console.error('Error al cargar la plantilla:', error))

fetch("html/week.html")
    .then(response => response.text())
    .then(data => {
        weekhtml = data;
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

        if (!DaysArray.includes(datedaytosearch)) { // si no existe un dia con la fecha de order crea uno nuevo
          DaysArray.push(datedaytosearch);
          newday(this.date.getDate(), this.date.getMonth(), this.date.getFullYear());
        }
        
        document.getElementById(datedaytosearch).querySelector(".dayactivity").appendChild(this.frame);
    }

    delete() {
        let confirmd = confirm("Deseas eliminar este pedido?")
        if (confirmd) {
            fetch(`/orders/${this.id}`, { method: 'DELETE' })
            .then(() => {
                this.frame.remove();
                ORDERS.splice(this.id, 1);
                document.removeChild(this.frame.closest('.weekpestain'))
                document.removeChild(this.frame.closest('.daypestain'))
            })
            .catch(error => console.error('Error al eliminar la orden:', error));
        }
    }
}

function newday(day, month, year) {
    // Crear la fecha correctamente con año, mes y día
    const date = new Date(year, month, day);
    const id = `${day}-${month + 1}-${year}`; // Formato: DD-MM-YYYY

    // Verificar si el día está en una semana existente
    const weekData = checkDayIsInWeek(date.getDate());
    let week = weekData[1];

    if (!week) {
        console.log(`El día no está en una semana existente: ${date.getDate()}, ${week}`);
        const newWeek = NewWeek(date);
        week = newWeek[1]; // Asignar la nueva semana
        console.log(`Nueva semana creada: ${week.id}`);
    }

    // Crear un nuevo elemento HTML para el día
    const frame = document.createElement("div");
    frame.className = "daypestain";
    frame.id = id;
    frame.innerHTML = dayhtml;
    frame.querySelector(".info_day").textContent = `Día: ${day}-${month + 1}-${year}`;

    // Agregar el elemento al contenedor de la semana
    const weekContainerId = `${week.id}`;
    document.getElementById(weekContainerId).querySelector(".weekcontainer").appendChild(frame);

    // Agregar el ID al array de días
    DaysArray.push(id);
}

function NewWeek(date) {
    // Calcular el inicio (lunes) y el final (domingo) de la semana
    const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()) || new Date(); // Usar una copia de la fecha global
    let weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - baseDate.getDay() + 1); // Lunes

    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo

    // Convertir fechas a formato legible (YYYY-MM-DD)
    const formattedWeekStart = weekStart.toISOString().split("T")[0];
    const formattedWeekEnd = weekEnd.toISOString().split("T")[0];

    const id = formattedWeekStart + "-" + formattedWeekEnd

    // Crear objeto semana
    const week = { weekStart: formattedWeekStart, weekEnd: formattedWeekEnd, payed: false, id: id};

    // Crear y añadir un elemento DOM para la semana
    const frame = document.createElement("div");
    frame.className = "weekpestain";
    frame.id = `${id}`;
    frame.innerHTML = weekhtml; // Se asume que `weekhtml` está definido
    frame.querySelector(".info_day").textContent = `Semana: ${formattedWeekStart} - ${formattedWeekEnd}`;
    document.getElementById("activity").appendChild(frame);

    // Almacenar la semana en el array
    weekArray.push(week);

    return [true, week];
}

function editorder(id,date,quantity,payed){
    // Buscar el día en el array
    const orderIndex = ORDERS.findIndex(order => order.id === id);

    // Actualizar la información del día

    //si existe el cambio lo actualiza
    if (orderIndex !== -1) {
        if (date) {
            ORDERS[orderIndex].date = date;
        }
        if (quantity) {
            ORDERS[orderIndex].cantity = quantity;
        }
        if (payed) {
            ORDERS[orderIndex].payed = payed;
        }
        fetch(`/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ORDERS[orderIndex])
        })
    console.error("No se encontró la orden con el ID proporcionado.");
    }
}

function checkDayIsInWeek(day) {
    // Crear un objeto de fecha para el día a verificar
    const checkDate = new Date(date.getFullYear(), date.getMonth(), day);

    for (let i = 0; i < weekArray.length; i++) {
        const week = weekArray[i];
        const weekStart = new Date(week.weekStart);
        const weekEnd = new Date(week.weekEnd);

        // Verificar si el día está dentro del rango de la semana
        if (checkDate >= weekStart && checkDate <= weekEnd) {
            return [true, week]; // Devuelve true y la semana encontrada
        }
    }

    return [false, null]; // Devuelve false si no se encuentra ninguna semana
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
                errormessages = data.errormessages;
                errormessages.forEach(errorMessage => {
                    ErrorMessages.push(errorMessage);
                })
                updatevalues();
                OrdersCharged = true
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

        fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: newOrder.id,
                cantity: newOrder.cantity,
                date: newOrder.date.toISOString(), // Asegúrate de enviar la fecha en formato ISO
                payed: false
            })
        })
        .catch(error => console.error('Error al guardar la orden:', error));
        updatevalues();
    } else {
        alert("Por favor, ingresa un número válido.");
    }
});

function updatevalues() {
    let orders = 0, ordersnotpayed = 0;

    ORDERS.forEach(orderData => {
        orders += orderData.cantity;
        if (!orderData.payed) {
            ordersnotpayed += orderData.cantity;
        }
    });

    let totalgains = orders * 500;
    let ultimgains = ordersnotpayed * 500;
    document.getElementById("totalorders").textContent = `Total de Pedidos: ${orders}`;
    document.getElementById("totalgains").textContent = `Total de Ganancias: ${totalgains}`;
    document.getElementById("ultimorders").textContent = `Pedidos: ${ordersnotpayed}`;
    document.getElementById("ultimgains").textContent = `Ganancias: ${ultimgains}`;
    document.getElementById("chargeamount").textContent = `Monto de cargos: ${ultimgains}`

    ErrorMessages.forEach(element => {
        const errorElement = document.getElementById(element.name);

        if (orders === 0 && !errorElement) {
            let messageError = document.createElement("span");
            messageError.textContent = element.message;
            messageError.classList.add("infotext");
            messageError.id = element.name;
            messageError.style.marginLeft = "2%";
            document.getElementById("activity").appendChild(messageError);
        } else if (orders > 0 && errorElement) {
            errorElement.remove();
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    updatevalues();

    // Agregar un evento de clic al botón de pagar una semana
    document.body.addEventListener("input", (event) => {
        if (event.target.classList.contains("payedButton")) {
            const weekElement = event.target.closest(".weekpestain");
            const weekId = weekElement.id;

            const checkbox = event.target;
    
            const week = weekArray.find(week => week.id === weekId);
            if (!week) return;
    
            week.payed = true;
    
            let weekOrders = [];
    
            ORDERS.forEach(orderData => {
                let checkfactor = checkDayIsInWeek(new Date(orderData.date).getDate());
                if (checkfactor[0] && checkfactor[1].id === weekId) {
                    weekOrders.push(orderData);
                }
            });
    
            // Actualizar cada orden de la semana
            weekOrders.forEach(orderData => {
                if (checkbox.checked) {
                    orderData.payed = true;
                } else {
                    orderData.payed = false;
                }
    
                // Llamar al endpoint para actualizar la orden
                fetch(`/orders/${orderData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al actualizar la orden: ' + response.statusText);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error al actualizar la orden:', error);
                });
            });
        }
    });
});

function updateweeks(){
    if (weekArray){
        weekArray.forEach(week => {
            let weekOrders = [];

            let allpayed = true;
    
            ORDERS.forEach(orderData => {
                let checkfactor = checkDayIsInWeek(new Date(orderData.date).getDate());
                if (checkfactor[0] && checkfactor[1].id === week.id) {
                    weekOrders.push(orderData);
                }
            });

            weekOrders.forEach(orderData => {
                if (!orderData.payed) {
                    allpayed = false;
                }
            });

            const weekElement = document.getElementById(week.id);

            if (allpayed){
                weekElement.querySelector(".payedButton").checked = true;
                weekElement.style.backgroundColor = "#f1ffed";
            }else{
                weekElement.querySelector(".payedButton").checked = false;
                weekElement.style.backgroundColor = "";
            }
        })
    }
}
setInterval(() => {
    if (OrdersCharged) {
        updatevalues();
        updateweeks();
    }
}, 500); // Ejecuta cada 1 segundo