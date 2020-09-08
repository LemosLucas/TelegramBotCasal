const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

async function connect() {
  let connection;
  try {
    connection = await client.connect();
    console.log('Connected to the database.');
  } catch (error) {
    console.log('Error connecting to the database', error.stack);
    throw error;
  }
  return connection;
}

module.exports = {
  connect,
  client
};

/* client
  .query('SELECT * FROM purchases')
  .then(result => console.log(result))
  .catch(e => console.error(e.stack))
  .then(() => client.end()); */