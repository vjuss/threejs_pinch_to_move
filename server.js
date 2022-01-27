const express = require("express");
const app = express();
const server = app.listen(3022); // or (port)
app.use(express.static("public"));

console.log("It works");
