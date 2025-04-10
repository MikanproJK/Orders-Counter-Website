# Contador de Pedidos

## Descripción
Aplicación web para contar y gestionar pedidos, desarrollada con Node.js, Express y frontend en HTML/CSS/JS.

## Objetivos
- Aprender nodejs, js, html, css etc.
- Aprender a organizar una página web
- Hacer más fácil y digitalizar una tarea por libreta
- Llevar la cuenta de mejor manera

## Características
- Visualizador de pedidos
- Resumen de todas las ganancias y pedidos
- Sistema de organización de pedidos a base de semanas y días

## Requisitos
- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clonar el repositorio:
   ```
   git clone [URL del repositorio]
   cd contador-de-pedidos
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Modificar las variables según sea necesario

## Ejecución

### Desarrollo
```
npm run dev
```

### Producción
```
npm start
```

## Despliegue

Esta aplicación está preparada para ser desplegada en plataformas como Heroku, Render, o Railway.

### Heroku
1. Crear una cuenta en [Heroku](https://heroku.com)
2. Instalar [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Iniciar sesión en Heroku CLI:
   ```
   heroku login
   ```
4. Crear una aplicación en Heroku:
   ```
   heroku create
   ```
5. Desplegar la aplicación:
   ```
   git push heroku main
   ```

### Render o Railway
Seguir las instrucciones específicas de cada plataforma para desplegar una aplicación Node.js.

## Estructura de archivos
- `server.js`: Servidor Express con endpoints para gestionar pedidos
- `public/`: Archivos estáticos del frontend
- `orders.json`: Base de datos local para almacenar pedidos

## Licencia
Desarrollado por MikanproJK
