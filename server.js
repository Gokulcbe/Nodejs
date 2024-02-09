require('dotenv').config();
const mongoString = process.env.DATABASE_URL

const mongoose = require('mongoose'); 

const express = require('express');
const app = express();
app.use(express.json());

const port = 5000;
mongoose.connect(mongoString);
const database = mongoose.connection;



database.on('error', (error) => {
    console.log(error)
})
database.once('connected', () => {
    console.log('Database Connected');
})

const routes =require('./routes/routes');
const userroutes = require('./routes/UserRouter');
const grouproutes = require('./routes/GroupRouter');

app.use('/api', routes);
app.use('/user', userroutes);
app.use('/group', grouproutes);

app.listen(port, () => {
    console.log("Now listening on port 5000");
})