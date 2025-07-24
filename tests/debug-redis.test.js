describe('Debug Redis Mock', () => {
    test('Check redis mock structure', () => {
        const redis = require('redis');
        console.log('Redis object:', redis);
        console.log('createClient type:', typeof redis.createClient);
        
        const client = redis.createClient();
        console.log('Client object:', client);
        console.log('Client connect type:', typeof client.connect);
        
        expect(redis).toBeDefined();
        expect(client).toBeDefined();
    });
});