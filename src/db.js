require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { DB_AWS } = process.env;

const sequelize = new Sequelize(DB_AWS, {
  dialectModule: pg,
  logging: false,
  native: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Dogs, Temperaments } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);
Dogs.belongsToMany(Temperaments, {through: "BreedTemperament"}); 
Temperaments.belongsToMany(Dogs, {through: "BreedTemperament"});

//================ Pruebas ======================
// Dogs.hasOne(Height)
// Height.belongsTo(Dogs)

// Dogs.hasOne(Weight)
// Weight.belongsTo(Dogs)
//===============================================

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
