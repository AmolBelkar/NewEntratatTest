const express = require("express");
const cors = require("cors");
const path = require("path");

const codeRoutes = require("./routes/codeRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/code", codeRoutes);

module.exports = app;