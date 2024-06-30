// src/app.js

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const dishRoutes = require('./routes/dishRoutes');
const rationRoutes = require('./routes/rationRoutes');

const app = express();
app.use(cors());

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/rations', rationRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
