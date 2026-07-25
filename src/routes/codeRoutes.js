const express = require("express");
const router = express.Router();

const codeController = require("../controllers/codeController");

router.post("/explain", codeController.explainCode);

module.exports = router;