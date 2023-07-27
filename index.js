const express = require("express");
const app = express();
app.use(express.json());
app.use("/smart-grounds/api",require("./routes/app.routes"));
app.listen(4000,function(){
    console.log("Ready to go");
    console.log("Server is up");
})