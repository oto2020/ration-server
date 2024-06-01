import express from 'express';
import bodyParser from 'body-parser';
import { productRoutes } from './routes/productRoutes';

const app = express();

app.use(bodyParser.json());
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});