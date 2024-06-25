// src/controllers/rationController.js

const {
  createNewRation, 
  fetchRations, 
  fetchRationById,
  updateRation,
  deleteRation,
} = require('../services/rationService');

const createRation = async (req, res) => {
  console.log(`createRation`);
  try {
    const rationData = req.body;
    console.log(rationData);
    const newRation = await createNewRation(rationData);
    res.status(201).json(newRation);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

// const getRations = async (req, res) => {
//   try {
//     // const mode = req.query.mode || 'full';
//     // const search = req.query.search;
    
//     // console.log(`getRations ${mode} ${search}`);
//     // let products = search ? await searchProducts(search, mode) : await fetchProducts(mode);
//     let rations = [];
//     res.status(200).json(rations);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'An unknown error occurred' });
//     }
//   }
// };

// const getRationById = async (req, res) => {
//   console.log(`getRationById`);
//   try {
//     const { id } = req.params;
//     const mode = req.query.mode || 'full';
//     // const product = await fetchProductById(Number(id), mode);
//     let ration = [];
//     if (ration) {
//       res.status(200).json(ration);
//     } else {
//       res.status(404).json({ error: 'Ration not found' });
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'An unknown error occurred' });
//     }
//   }
// };

// const updateRationById = async (req, res) => {
//   console.log(`updateRationById`);
//   try {
//     const { id } = req.params;
//     const rationData = req.body;
//     const updatedRation = await updateRation(Number(id), rationData);
//     res.status(200).json(updatedRation);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(400).json({ error: error.message });
//     } else {
//       res.status(400).json({ error: 'An unknown error occurred' });
//     }
//   }
// };

// const deleteRationById = async (req, res) => {
//   console.log(`deleteRationById`);
//   try {
//     const { id } = req.params;
//     await deleteRation(Number(id));
//     res.status(204).send();
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'An unknown error occurred' });
//     }
//   }
// };

module.exports = {
  createRation,
  // getRations,
  // getRationById,
  // updateRationById,
  // deleteRationById,
};
