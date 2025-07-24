// Mock socket.io for testing
const mockSocket = {
  id: 'mock-socket-id',
  userId: 'mock-user-id',
  handshake: {
    auth: {
      token: 'mock-token'
    }
  },
  emit: jest.fn(),
  on: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  disconnect: jest.fn()
};

const mockServer = {
  use: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  to: jest.fn(() => ({
    emit: jest.fn()
  })),
  sockets: {
    emit: jest.fn()
  }
};

const Server = jest.fn(() => mockServer);

module.exports = {
  Server,
  mockServer,
  mockSocket
};