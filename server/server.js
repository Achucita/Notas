const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const send = require('koa-send');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const { registrarUsuario, loginUsuario, verificarToken } = require('./auth');

const app = new Koa();
const router = new Router();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser());
app.use(serve(path.join(__dirname, '../cliente')));

// Registro de usuario
router.post('/api/registrar', async (ctx) => {
    try {
        const { username, email, password } = ctx.request.body;
        const resultado = await registrarUsuario(username, email, password);
        ctx.status = 201;
        ctx.body = resultado;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
});

// Login de usuario
router.post('/api/login', async (ctx) => {
    try {
        const { username, password } = ctx.request.body;
        const resultado = await loginUsuario(username, password);
        ctx.body = resultado;
    } catch (error) {
        ctx.status = 401;
        ctx.body = { error: error.message };
    }
});

// Middleware para proteger las rutas de notas
router.use('/api/notas', async (ctx, next) => {
    await verificarToken(ctx, next);
});

// Obtener notas
router.get('/api/notas', async (ctx) => {
    await new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM notas WHERE usuario_id = ? ORDER BY fecha_recordatorio IS NULL, fecha_recordatorio ASC',
            [ctx.state.userId],
            (err, notas) => {
                if (err) {
                    ctx.status = 500;
                    ctx.body = { error: err.message };
                    return reject(err);
                }
                ctx.body = notas;
                resolve();
            }
        );
    });
});

// Agregar nota
router.post('/api/notas', async (ctx) => {
    const { titulo, contenido, fecha_recordatorio, aviso_activo } = ctx.request.body;
    const id = uuidv4();
    const isoFecha = fecha_recordatorio ? new Date(fecha_recordatorio).toISOString() : null;

    await new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO notas (id, titulo, contenido, fecha_recordatorio, aviso_activo, usuario_id, notificado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, titulo, contenido, isoFecha, aviso_activo ? 1 : 0, ctx.state.userId, 0],
            function (err) {
                if (err) {
                    ctx.status = 500;
                    ctx.body = { error: err.message };
                    return reject(err);
                }
                ctx.status = 201;
                ctx.body = {
                    id,
                    titulo,
                    contenido,
                    fecha_creacion: new Date().toISOString(),
                    fecha_recordatorio: isoFecha,
                    aviso_activo,
                    usuario_id: ctx.state.userId,
                    notificado: 0
                };
                resolve();
            }
        );
    });
});

// Eliminar nota
router.delete('/api/notas/:id', async (ctx) => {
    const id = ctx.params.id;
    await new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM notas WHERE id = ? AND usuario_id = ?',
            [id, ctx.state.userId],
            function (err) {
                if (err) {
                    ctx.status = 500;
                    ctx.body = { error: err.message };
                    return reject(err);
                }
                if (this.changes === 0) {
                    ctx.status = 404;
                    ctx.body = { error: 'Nota no encontrada' };
                } else {
                    ctx.status = 204;
                }
                resolve();
            }
        );
    });
});

// Ruta principal
router.get('/app', async (ctx) => {
    await send(ctx, 'app.html', { root: path.join(__dirname, '../cliente') });
});

// Activar notificador
require('./notificador');

// Usar rutas
app.use(router.routes()).use(router.allowedMethods());

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor Koa corriendo en http://localhost:${PORT}`);
});
