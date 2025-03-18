// middlewares/auth.js
module.exports.requireLogin = function (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    next();
};

module.exports.requireAdmin = function (req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos de administrador' });
    }
    next();
};
