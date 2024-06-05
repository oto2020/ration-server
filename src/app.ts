import express from 'express';
import { productRoutes } from './routes/productRoutes';
import { dishRoutes } from './routes/dishRoutes';

const app = express();

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/dishes', dishRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
