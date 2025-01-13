const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Para servir el frontend

const ordersFile = path.join(__dirname, 'orders.json'); // Asegurarse de que la ruta al archivo sea correcta

// Endpoint para obtener todas las órdenes
app.get('/orders', (req, res) => {
    fs.readFile(ordersFile, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de órdenes' });
        }
        const orders = JSON.parse(data || '[]');
        res.json(orders);
    });
});

// Endpoint para agregar una nueva orden
app.post('/orders', (req, res) => {
    const newOrder = req.body; // Datos del nuevo pedido enviados desde el cliente

    // Leer el archivo JSON
    fs.readFile(ordersFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo JSON');
        }

        const jsonData = JSON.parse(data); // Convertir el contenido a un objeto JavaScript

        // Añadir el nuevo pedido al arreglo de orders
        jsonData.orders.push(newOrder);

        // Escribir el archivo JSON actualizado
        fs.writeFile(ordersFile, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir en el archivo JSON');
            }
            res.send('Nuevo pedido añadido correctamente');
        });
    });
});

// Endpoint para eliminar una orden
// Endpoint para eliminar una orden
app.delete('/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id, 10); // Obtener el ID de la orden desde la URL
    fs.readFile(ordersFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de órdenes' });
        }

        let ordersdata;
        try {
            ordersdata = JSON.parse(data); // Convertir el contenido del archivo a un objeto JSON
        } catch (parseError) {
            return res.status(500).json({ error: 'Error al analizar el archivo de órdenes' });
        }

        // Filtrar la orden a eliminar
        const updatedOrders = ordersdata.orders.filter(order => order.id !== orderId);

        // Crear un nuevo objeto con las órdenes actualizadas y las órdenes actuales
        const updatedData = {
            orders: updatedOrders,
            currentOrders: ordersdata.currentOrders,
            errormessages: ordersdata.errormessages,
        };

        // Guardar el archivo actualizado
        fs.writeFile(ordersFile, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar las órdenes' });
            }
            res.status(200).json({ message: 'Orden eliminada' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});