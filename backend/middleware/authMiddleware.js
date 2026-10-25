const userRepository = require('../repositories/userRepository');

async function requireAuthenticatedUser(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const user = await userRepository.findBySessionToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Your session is invalid or expired.' });
    }

    req.authenticatedUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAdmin(req, res, next) {
  return requireAuthenticatedUser(req, res, () => {
    if (String(req.authenticatedUser.role || '').trim().toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }

    return next();
  });
}

module.exports = { requireAuthenticatedUser, requireAdmin };
