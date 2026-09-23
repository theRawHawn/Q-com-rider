const { verifySocketJWT } = require('../middleware/auth');

/**
 * Real-time fleet dispatch WebSocket handler
 * Remediates CWE-287 (Improper Authentication) & PII Eavesdropping
 */
module.exports = (io) => {
  // Authenticate socket handshake using JWT bearer verification
  io.use(verifySocketJWT);

  // Line 9 - Restrict connection and room subscriptions to authenticated and authorized roles
  io.on('connection', (socket) => {
    if (!socket.user || socket.user.role !== 'dispatcher') {
      socket.emit('auth_error', {
        error: 'Unauthorized: Fleet dispatch channel requires dispatcher role',
        cwe: 'CWE-287',
      });
      return socket.disconnect(true);
    }

    // Secure room join restricted to verified dispatchers
    socket.on('join_fleet_channel', (data) => {
      const channel = data?.channel || 'fleet_dispatch_all';

      // Enforce role-based access control (RBAC) on dispatch streams
      if (socket.user.role !== 'dispatcher') {
        return socket.emit('error', {
          error: 'Access denied: Customer PII stream restricted to authorized dispatcher role',
        });
      }

      socket.join(channel);
      socket.emit('joined', {
        channel,
        authenticatedUser: socket.user.id,
        role: socket.user.role,
        message: 'Secure fleet dispatch channel subscribed successfully',
      });
    });

    socket.on('disconnect', () => {
      // Clean up socket subscriptions
    });
  });
};
