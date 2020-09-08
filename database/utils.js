const { client } = require('./index');


async function create({ entry, table }) {
  return true;
}

async function read({ table, entry = null, column = null }) {
  const whereQuery = column ? `where  ${column}='${entry}'` : '';
  const result = await client.query(`SELECT * FROM ${table} ${whereQuery};`);
  return result;
}

async function update() {
  return true;
}

async function remove() {
  return true;
}




module.exports = {
  create,
  read,
  update,
  remove
};