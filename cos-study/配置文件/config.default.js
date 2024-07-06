const path = require('path');
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// console.log(process.env,'lllllllllllllllllllll');
module.exports = process.env