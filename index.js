const express = require("express");
const telegram = require("./api/telegram");

const app = express();

app.use("/api/telegram", telegram);

app.listen(process.env.PORT, () => {
	console.log("Server running on port 3000");
});
