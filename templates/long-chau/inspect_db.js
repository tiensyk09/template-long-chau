const mysql = require('mysql2/promise');

async function inspect() {
  const connection = await mysql.createConnection({
    host: '162.62.54.247',
    port: 31760,
    user: 'root',
    password: 'bJ0g168FRq24iuhn3wL7eQyNjU5pG9Ac',
    database: 'zeabur'
  });

  const [rows] = await connection.execute('SELECT slug, title, layout FROM pages WHERE slug = "index"');
  console.log('INDEX PAGE LAYOUT FROM DB:');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

inspect().catch(console.error);
