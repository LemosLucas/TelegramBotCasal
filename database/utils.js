const { client } = require('./index');


async function create({ table, entry, column }) {
  if (!table || !entry || !column) return [];
  const result = await client.query(`INSERT INTO ${table} (${column}) VALUES ('${entry}');`);
  return result;
}

async function read({ table, entry = null, column = null }) {
  const whereQuery = column ? `where  ${column}='${entry}'` : '';
  const result = await client.query(`SELECT * FROM ${table} ${whereQuery};`);
  return result;
}

async function update({ table, oldEntry, newEntry, column }) {
  if (!table || !oldEntry || !newEntry || !column) return [];
  const result = await client.query(`UPDATE ${table} SET ${column} = '${newEntry}' WHERE ${column} = '${oldEntry}';`);
  return result;
  // UPDATE films SET kind = 'Dramatic' WHERE kind = 'Drama';
}

async function remove({ table, column, entry }) {
  if (!table || !entry || !column) return [];
  const result = await client.query(`DELETE FROM ${table} where ${column}='${entry}';`);
  return result;
}




module.exports = {
  create,
  read,
  update,
  remove
};