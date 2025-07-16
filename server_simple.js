const app = require('./app');

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});