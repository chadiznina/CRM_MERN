require("dotenv").config();
require('express-async-errors');

const connectDB = require("./db/connect");
const express = require("express");
const cors = require('cors')
const app = express();
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");

app.use(express.json());

app.use(cors())
app.use("/api/v1", userRouter);
app.use("/api/v1/projects", projectRouter);

const port = process.env.PORT || 3000;

const start = async () => {

    try {        
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        })

    } catch (error) {
       console.log(error); 
    }
}

start();
