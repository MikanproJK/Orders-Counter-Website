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

// consts
const rate = 500;

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
    constructor(cantity, renderize) {
        this.cantity = cantity;
        this.date = new Date();
        this.id = Math.pow(ORDERS.length*40 + this.date.getMilliseconds()*20+this.date.getSeconds()*25+this.date.getMinutes()*30+this.date.getHours()*35+Math.floor(Math.random() * 1000),2);

        this.frame = document.createElement("div");
        this.frame.className = "order";
        this.frame.innerHTML = OrderHTML;
        if (!renderize===false) {this.init()}
    }

    init() {
        this.frame.querySelector("#OrderORDERS").textContent = `Pedidos: ${this.cantity}`;
        this.frame.querySelector("#ordergains").textContent = `Ganancias: ${this.cantity * rate}`;
        this.frame.querySelector("#orderid").textContent = `ID: ${this.id}`;
        this.frame.querySelector("#orderday").textContent = `Día: ${this.date.toLocaleDateString()}`;
        this.frame.querySelector('#orderhour').textContent = `Hora: ${this.date.toLocaleTimeString()}`;
        this.frame.querySelector('.delete').addEventListener('click', () => this.delete());
        this.frame.id = this.id;

        const datedaytosearch = this.date.getDate() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getFullYear();

        if (!DaysArray.includes(datedaytosearch)) { // si no existe un dia con la fecha de order crea uno nuevo
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
        const newWeek = NewWeek(date);
        week = newWeek[1]; // Asignar la nueva semana
    }

    // Crear un nuevo elemento HTML para el día
    const frame = document.createElement("div");
    frame.className = "daypestain pestaincontainerframe";
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
    frame.className = "weekpestain pestaincontainerframe";
    frame.id = `${id}`;
    frame.innerHTML = weekhtml; // Se asume que `weekhtml` está definido
    frame.querySelector(".info_day").textContent = `Semana: ${formattedWeekStart} - ${formattedWeekEnd}`;
    document.getElementById("orderscontainer").appendChild(frame);

    // Almacenar la semana en el array
    weekArray.push(week);

    return [true, week];
}

function editorder(orderid, newid, datevars, quantity, payed) {
    // Buscar el día en el array
    const ordernumber = parseInt(orderid, 10);
    const orderIndex = ORDERS.findIndex(order => order.id === ordernumber);

    if (orderIndex === -1) {
        console.error("Orden no encontrada");
        return;
    }

    // Obtener la fecha y hora actual
    const currentDate = new Date(ORDERS[orderIndex].date);

    const currentmonth = currentDate.getMonth() + 0;
    let newmonth
    if (datevars[1] === null || datevars[1] === undefined || isNaN(datevars[1])) {
        newmonth = currentmonth;
    }else {
        newmonth = datevars[1] - 1;
    }

    // Inicializar variables para año, mes, día, horas y minutos
    let year, month, day, hours, minutes;

    // Si se proporciona date, usarlo para extraer los valores
    year = datevars[0] || currentDate.getFullYear();
    month = newmonth;
    day = datevars[2] || currentDate.getDate();
    hours = datevars[3] || currentDate.getHours();
    minutes = datevars[4] || currentDate.getMinutes();

    // Si alguno de los campos está vacío, usar los valores actuales
    if (newid === null || newid === undefined || isNaN(newid)) {
        newid = ORDERS[orderIndex].id; // Mantener el ID actual si no se proporciona uno nuevo
    }
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
        quantity = ORDERS[orderIndex].quantity; // Mantener la cantidad actual si no se proporciona una nueva
    }
    if (payed === null || payed === undefined) {
        payed = ORDERS[orderIndex].payed; // Mantener el estado de pago actual si no se proporciona uno nuevo
    }
    // Crear un nuevo objeto Date con los valores finales
    const updatedDate = new Date(year, month, day, hours, minutes);
    const isoString = updatedDate.toISOString(); // Convertir a formato ISO

    // Actualizar la orden
    ORDERS[orderIndex].date = isoString; // Actualizar la fecha
    ORDERS[orderIndex].cantity = quantity; // Actualizar la cantidad
    ORDERS[orderIndex].payed = payed; // Actualizar el estado de pago
    ORDERS[orderIndex].id = newid; // Actualizar el ID

    // Enviar la actualización al servidor
    fetch(`/orders/${orderid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ORDERS[orderIndex])
    })
    .then(response => {
        if (response.ok) {
            reloadcontent(); 
            console.log("saved");// Recargar el contenido si la respuesta es exitosa
        } else {
            console.error('Error al actualizar la orden:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}
function reloadcontent(){
    removeallorders();
    loadOrders();
    allcharged = false;
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
function loadOrders(date,orders,week) {
    fetch('/orders')
        .then(response => response.json())
        .then(data => {
            if (data) {
                ORDERS = data.orders;
                ORDERS.forEach(orderData => {
                    if (!date && !orders && !week) {
                        const newOrder = new Order(orderData.cantity);
                        newOrder.id = orderData.id;
                        newOrder.date = new Date(orderData.date);
                        newOrder.payed = orderData.payed;
                        newOrder.init();
                        return
                    }else{
                        if (date){
                            if (new Date(orderData.date).toISOString().split('T')[0] === date){
                                const newOrder = new Order(orderData.cantity);
                                newOrder.id = orderData.id;
                                newOrder.date = new Date(orderData.date);
                                newOrder.payed = orderData.payed;
                                newOrder.init();
                            }
                        }
                        if (orders){
                            if (orderData.cantity === orders){
                                const newOrder = new Order(orderData.cantity);
                                newOrder.id = orderData.id;
                                newOrder.date = new Date(orderData.date);
                                newOrder.payed = orderData.payed;
                                newOrder.init();
                            }
                        }
                        if (week){
                            const newOrder = new Order(orderData.cantity);
                            newOrder.id = orderData.id;
                            newOrder.date = new Date(orderData.date);
                            newOrder.payed = orderData.payed;
                            newOrder.init();
                            const checkday = checkDayIsInWeek(newOrder.date.getDate());
                            if (checkday[0] && checkday[1].weekStart === week){
                            }else{
                                newOrder.frame.closest(".weekpestain").remove();
                                newOrder.frame.closest(".daypestain").remove();
                                newOrder.frame.remove();
                                ORDERS.splice(newOrder.id, 1);
                            }
                        }
                    }
                });
                errormessages = data.errormessages;
                errormessages.forEach(errorMessage => {
                    ErrorMessages.push(errorMessage);
                })
                updatevalues();
                OrdersCharged = true
            }
        })
        .catch(error => console.error('Error al cargar las órdenes:', error));
}

function removeallorders(){
    OrdersCharged = false;
    ORDERS = [];
    DaysArray = [];
    weekArray = [];
    updatevalues();
    document.getElementById("orderscontainer").innerHTML = "";
}
document.getElementById("searchb").addEventListener("click", () => {
    removeallorders();
    const dateInput = document.getElementById("datefilter").value;
    let datefilter;

    if (dateInput) {
        datefilter = new Date(dateInput).toISOString().split('T')[0];
    } else {
        datefilter = null; // O puedes asignar un valor por defecto si lo deseas
    }

    const ordersfilter = parseInt(document.getElementById("ordersfilter").value, 10);
    const weekfilter = document.getElementById("weekfilter").value;

    let weekStart = null;

    // Si hay un filtro de semana, calcular el inicio y fin de la semana
    if (weekfilter) {
        const { start, end } = getStartAndEndOfWeek(weekfilter);
        if (start){weekStart = start.toISOString().split('T')[0];}
        if (end){weekEnd = end.toISOString().split('T')[0];}
    }
    loadOrders(datefilter, ordersfilter, weekStart);
});

// Función para obtener el inicio y fin de la semana
function getStartAndEndOfWeek(weekValue) {
    const [year, week] = weekValue.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const startOfWeek = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
    
    const dayOfWeek = startOfWeek.getDay();
    const mondayOffset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
        start: startOfWeek,
        end: endOfWeek,
    };
};


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
    document.getElementById("totalweeks").textContent = `Total de Semanas: ${weekArray.length}`;
    document.getElementById("totaldays").textContent = `Total de Días: ${DaysArray.length}`;
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
let openfilters = false;

function openfiltersfunc(){
    if (openfilters) {
        document.querySelector(".filters").style.display = "none";
        openfilters = false;
    } else {
        document.querySelector(".filters").style.display = "block";
        openfilters = true;
    }
};

function OnAllcharged(){
        updatevalues();
    
    // Agregar un evento de clic al botón de pagar una semana
    document.body.addEventListener("click", (event) => {
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

    const toggleElements = document.getElementsByClassName("toggleview");

    for (let i = 0; i < toggleElements.length; i++) {
        const element = toggleElements[i];
        element.hiddenState = true; // Inicializa el estado del elemento

        element.addEventListener("click", () => {
            const contentframe = element.closest(".pestaincontainerframe").querySelector(".contentframe");
            const children = contentframe.children; // Obtén los hijos de dayActivity
            if (!element.hiddenState) {
                element.textContent = "Mostrar";
                for (let j = 0; j < children.length; j++) {
                    children[j].style.display = "none"; // Oculta cada hijo
                }
                element.hiddenState = true;
            } else {
                element.textContent = "Ocultar";
                for (let j = 0; j < children.length; j++) {
                    children[j].style.display = "flex"; // Muestra cada hijo
                }
                element.hiddenState = false;
            }
        });
    }

    let methods = document.getElementsByClassName("methods");
    let Editbtns = [];
    for (let i = 0; i < methods.length; i++) {
        const elementparent = methods[i];
        const editbutton = elementparent.querySelector("#edit");
        if (editbutton) {
            Editbtns.push(editbutton);
            let condition = false;
            editbutton.addEventListener("click", () => {
                const infodiv = elementparent.closest(".order").querySelector(".info");
                let editinputs = infodiv.querySelector(".editinputs");
                if (condition) {
                    editinputs.style.display = "none";
                    condition = false;
                } else {
                    editinputs.style.display = "flex";
                    condition = true;
                }
            });
        }
    }
    const cancelinputs = document.getElementsByClassName("editcancelinput")
    for (let i = 0; i < cancelinputs.length; i++) {
        cancelinputs[i].addEventListener("click", () => {
            const infodiv = cancelinputs[i].closest(".order").querySelector(".info");
            let editinputs = infodiv.querySelector(".editinputs");
            editinputs.style.display = "none";
        });
    }
    const saveinputs = document.getElementsByClassName("editsaveinput");
    for (let i = 0; i < saveinputs.length; i++) {
        saveinputs[i].addEventListener("click", () => {
            const finaldesition = confirm("¿Deseas guardar los cambios?");
            if (finaldesition) {
                const maindiv = saveinputs[i].closest(".info");
                if (maindiv) {
                    const dayinput = maindiv.querySelector("#editdayinput").value; // Fecha en formato "YYYY-MM-DD"
                    const timeinput = maindiv.querySelector("#edittimeinput").value || null; // Hora en formato "HH:MM"
                    const idinput = maindiv.querySelector("#editidinput").value || null;
                    const quantityinput = maindiv.querySelector("#editorderinput").value || null;
                    const payedinput = maindiv.querySelector("#editorpayedinput").checked || null;

                    const mainorder = saveinputs[i].closest(".order");

                    // Verificar qué campos se tendrán que actualizar
                    const newid = parseInt(idinput, 10);
                    const newquantity = parseInt(quantityinput, 10);

                    // Crear un objeto Date a partir de los inputs
                    let year, month, day, hours, minutes;

                    if (timeinput) {
                        [hours, minutes] = timeinput.split(':'); // "HH:MM"
                    }

                    if (dayinput) {
                        [year, month, day] = dayinput.split('-'); // "YYYY-MM-DD"
                    }

                    // Convertir a números
                    year = parseInt(year, 10)|| null;
                    month = parseInt(month, 10) || null; // Restar 1 porque los meses son 0-indexados
                    day = parseInt(day, 10) || null;
                    hours = parseInt(hours, 10) || null;
                    minutes = parseInt(minutes, 10) || null;

                    // Crear el objeto Date
                    const datevars = [year, month, day, hours, minutes];

                    // Convertir a formato ISO
                    //const isoString = newDate.toISOString();

                    // Si tienes una función para editar la orden, puedes llamarla aquí
                    editorder(mainorder.id, newid, datevars, newquantity, payedinput);
                } else {
                    console.error("No se encontró el contenedor principal .editinputs");
                }
            }
        });
    }
}

document.getElementById("filtersbutton").addEventListener("click", () => {
    openfiltersfunc();
});

document.getElementById("activity").onscroll = () => {
    if (openfilters) {
        openfiltersfunc();
    }
};
document.getElementById("refresh").addEventListener("click", () => {
    reloadcontent();
});
let allcharged = false;

setInterval(() => {
    if (OrdersCharged) {
        updatevalues();
        updateweeks();
        if(!allcharged){
            allcharged = true;
            OnAllcharged();
        };
    };
}, 500); // Ejecuta cada 1 segundo