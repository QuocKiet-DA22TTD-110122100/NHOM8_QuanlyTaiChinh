const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    try {
      this.wss = new WebSocket.Server({ server });
      
      this.wss.on('connection', (ws, req) => {
        console.log('🔌 New WebSocket connection');
        this.clients.add(ws);

        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            console.log('📨 WebSocket message:', data);
            
            // Echo back or handle message
            ws.send(JSON.stringify({
              type: 'response',
              data: 'Message received',
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('WebSocket message error:', error.message);
          }
        });

        ws.on('close', () => {
          console.log('🔌 WebSocket connection closed');
          this.clients.delete(ws);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error.message);
          this.clients.delete(ws);
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          message: 'Connected to Finance App WebSocket',
          timestamp: new Date().toISOString()
        }));
      });

      console.log('✅ WebSocket server initialized');
    } catch (error) {
      console.error('❌ WebSocket initialization failed:', error.message);
    }
  }

  broadcast(message) {
    if (!this.wss) return;
    
    const data = JSON.stringify({
      type: 'broadcast',
      data: message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          console.error('Broadcast error:', error.message);
          this.clients.delete(client);
        }
      }
    });
  }

  sendToUser(userId, message) {
    // Implementation for sending to specific user
    // Would need to track user IDs with connections
    this.broadcast({ userId, message });
  }
}

module.exports = new WebSocketService();
