import express from 'express';
import cors from 'cors';
import { productRoutes } from './routes/productRoutes';
import { dishRoutes } from './routes/dishRoutes';

const app = express();
app.use(cors()); // Вызываем функцию cors, чтобы разрешить все адреса

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/dishes', dishRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
