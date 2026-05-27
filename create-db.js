const mysql = require('mysql2/promise');

async function createDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 3306,
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS sical_ti;');
    console.log('Database sical_ti created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Failed to create database:', error.message);
  }
}

createDb();
