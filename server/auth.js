const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const SECRET = 'tu_secreto_super_seguro';

async function registrarUsuario(username, email, password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return reject(err);
            db.run(
                'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
                [username, email, hash],
                function (error) {
                    if (error) return reject(error);
                    resolve({ id: this.lastID, username, email });
                }
            );
        });
    });
}

async function loginUsuario(username, password) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM usuarios WHERE username = ?',
            [username],
            (err, user) => {
                if (err) return reject(err);
                if (!user) return reject(new Error('Usuario no encontrado'));

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err || !result) return reject(new Error('Contraseña incorrecta'));

                    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '2h' });
                    resolve({ token });
                });
            }
        );
    });
}

async function verificarToken(ctx, next) {
    const authHeader = ctx.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'Token no proporcionado' };
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        ctx.state.userId = decoded.userId;
        await next();
    } catch (err) {
        ctx.status = 403;
        ctx.body = { error: 'Token inválido' };
    }
}

module.exports = {
    registrarUsuario,
    loginUsuario,
    verificarToken
};

