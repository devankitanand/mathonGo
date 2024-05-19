const express = require('express');
const userRoutes = require('./routes/userRoutes');
const db = require('./utils/db');
require('dotenv').config();

db();
const app = express();
const port = process.env.PORT || 4000;


app.use(express.json());
app.use(`${process.env.URL}/api`, userRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
