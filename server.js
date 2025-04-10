const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

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

// Endpoint para actualizar una orden
let isUpdating = false; // Variable de bloqueo

app.put('/orders/:id', async (req, res) => {
    const orderId = parseInt(req.params.id, 10);
    const updatedOrder = req.body;

    console.log(updatedOrder);

    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    if (!updatedOrder || Object.keys(updatedOrder).length === 0) {
        return res.status(400).json({ error: 'No data provided to update the order' });
    }

    // Esperar hasta que no haya otra actualización en curso
    while (isUpdating) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100 ms
    }

    isUpdating = true; // Bloquear actualizaciones

    try {
        const data = await fs.promises.readFile(ordersFile, 'utf8');
        let ordersData;

        try {
            ordersData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing orders file:', parseError);
            return res.status(500).json({ error: 'Invalid JSON format in orders file' });
        }

        const orderIndex = ordersData.orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Log before update
        console.log('Order Before Update:', ordersData.orders[orderIndex]);

        // Update the order
        ordersData.orders[orderIndex] = { ...ordersData.orders[orderIndex], ...updatedOrder };

        // Log after update
        console.log('Order After Update:', ordersData.orders[orderIndex]);

        await fs.promises.writeFile(ordersFile, JSON.stringify(ordersData, null, 2));

        res.status(200).json({ message: 'Order updated successfully', order: ordersData.orders[orderIndex] });
    } catch (err) {
        console.error('Error processing order update:', err);
        return res.status(500).json({ error: 'Failed to update order' });
    } finally {
        isUpdating = false; // Liberar el bloqueo
    }
});

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

        // Crear un nuevo objeto preservando las propiedades originales
        let updatedData = {
            orders: updatedOrders,
            currentOrders: ordersdata.currentOrders || [], // Mantener si está vacío
            errormessages: ordersdata.errormessages || [], // Mantener si no existe
        };

        // Guardar el archivo actualizado
        fs.writeFile(ordersFile, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar las órdenes' });
            }
            res.status(200).json({ message: 'Orden eliminada', orders: updatedOrders });
        });
    });
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});