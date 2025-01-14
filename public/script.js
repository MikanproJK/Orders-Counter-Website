let OrderHTML = '';
let dayhtml = '';
let weekhtml = '';

// orders array
let ORDERS = [];
let currentorders = [];

// contenedores de los pedidos
let DaysArray = [];
let weekArray = [];

let OrdersCharged = false;

let ErrorMessages = [];

date = new Date();

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

fetch("html/week.html")
    .then(response => response.text())
    .then(data => {
        weekhtml = data;
        console.log("HTML CARGDO", weekhtml);
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
        
        document.getElementById(datedaytosearch).querySelector(".dayactivity").appendChild(this.frame);
        console.log("added frame to activity");
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
    const date = new Date();
    const id = { day, month, year } || date.toISOString().split('T')[0];
    const completeId = date.toISOString().split('T')[0];
    const idString = `${day}-${month + 1}-${year}`;

    console.log("ID:", id, "Complete ID:", completeId);
    console.log("ID String:", idString);

    // Verificar si el día está en una semana existente
    const weekData = checkDayIsInWeek(date.getDate());
    let week = weekData ? weekData[1] : null;

    if (!week) {
        console.log("No se encontró una semana existente. Creando una nueva...");
        const newWeek = NewWeek();
        week = newWeek[1]; // Asignar la nueva semana
    }

    console.log("Week found:", week);

    console.log(`Week range: ${week.weekStart}-${week.weekEnd}`);

    // Crear un nuevo elemento HTML para el día
    const frame = document.createElement("div");
    frame.className = "daypestain";
    frame.id = idString;
    frame.innerHTML = dayhtml;

    console.log("Day HTML:", dayhtml);
    console.log("Week data:", week);

    // Agregar el elemento al contenedor de la semana
    const weekContainerId = `${week.weekStart}-${week.weekEnd}`;
    document.getElementById(weekContainerId).querySelector(".weekcontainer").appendChild(frame);

    // Agregar el ID al array de días
    DaysArray.push(id);
    console.log("Days Array:", DaysArray);
}

function NewWeek() {
    // Calcular el inicio (lunes) y el final (domingo) de la semana
    const baseDate = new Date(date); // Usar una copia de la fecha global
    let weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - baseDate.getDay() + 1); // Lunes

    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo

    // Convertir fechas a formato legible (YYYY-MM-DD)
    const formattedWeekStart = weekStart.toISOString().split("T")[0];
    const formattedWeekEnd = weekEnd.toISOString().split("T")[0];

    // Crear objeto semana
    const week = { weekStart: formattedWeekStart, weekEnd: formattedWeekEnd };
    console.log(week);

    // Crear y añadir un elemento DOM para la semana
    const frame = document.createElement("div");
    frame.className = "weekpestain";
    frame.id = `${formattedWeekStart}-${formattedWeekEnd}`;
    frame.innerHTML = weekhtml; // Se asume que `weekhtml` está definido
    document.getElementById("activity").appendChild(frame);

    // Almacenar la semana en el array
    weekArray.push(week);

    // Cargar los checkboxes (asumiendo que esta función está definida)
    loadcheckbox();
    return [true, week];
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
                    console.log(errorMessage);
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
        updatevalues();

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
    } else {
        alert("Por favor, ingresa un número válido.");
    }
});

function updatevalues() {
    let orders = 0
    ORDERS.forEach(orderData => {
        orders += orderData.cantity;
    })
    ErrorMessages.forEach(element => {
        if (element.id == 1) {
            if (orders == 0) {
                if (!document.getElementById(element.name)) {
                    let messageerror = document.createElement("span")
                    messageerror.textContent = element.message;
                    messageerror.classList.add("infotext");
                    messageerror.id = `${element.name}`;
                    messageerror.style.marginLeft = "2%";
                    document.getElementById("activity").appendChild(messageerror);
                }
            } else {
                if (document.getElementById(element.name)) {
                    document.getElementById("activity").removeChild(document.getElementById(element.name));
                }
            }
        }
    });
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
        //console.log("DAYHTML CARGADITOOOOOOOOO");
        //newday();
    }
})

function loadcheckbox() {
    if (weekhtml) {
        const checkbox = document.getElementById("payedButton");
        checkbox.oninput = (event) => {
            const isChecked = event.target.checked; // Obtener el estado del checkbox (true o false)
            const weekPestain = event.target.closest(".weekpestain");
    
            if (weekPestain) {
                console.log("El contenedor weekpestain fue encontrado:", weekPestain);
    
                // Aquí puedes realizar acciones con el contenedor `weekpestain`
                const weekInfo = weekPestain.querySelector(".weekinfo");
                if (weekInfo) {
                    console.log("Información de la semana:", weekInfo.textContent);
                }
    
                // Ejemplo: Cambiar el estilo del contenedor si el checkbox está marcado
                if (isChecked) {
                    weekPestain.style.backgroundColor = "#dfffde"; // Cambiar el color de fondo
                } else {
                    weekPestain.style.backgroundColor = ""; // Restaurar el color de fondo
                }
            } else {
                console.log("No se encontró el contenedor weekpestain.");
            }
        };
    }
}
setInterval(() => {
    updatevalues();
})