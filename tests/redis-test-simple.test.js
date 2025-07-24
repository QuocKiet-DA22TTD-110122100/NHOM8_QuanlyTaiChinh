describe('Redis Test Simple', () => {
    test('Redis mock works', () => {
        const redis = require('redis');
        const client = redis.createClient();
        
        console.log('Redis:', redis);
        console.log('Client:', client);
        
        expect(client).toBeTruthy();
        expect(client.connect).toBeDefined();
    });
});