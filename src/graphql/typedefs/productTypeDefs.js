const { gql } = require('apollo-server-express');

const productTypeDefs = gql`
  type Product {
    id: Int!
    name: String!
    subname: String
    productCategory: String!
    kcal: Float
    protein: Float
    fat: Float
    carbohydrate: Float
    fiber: Float
    sugar: Float
    ash: Float
    starch: Float
    calcium: Float
    iron: Float
    magnesium: Float
    phosphorus: Float
    potassium: Float
    sodium: Float
    zinc: Float
    copper: Float
    manganese: Float
    selenium: Float
    vitamin_a: Float
    vitamin_b3: Float
    vitamin_b4: Float
    vitamin_b5: Float
    vitamin_b6: Float
    vitamin_b9: Float
    vitamin_c: Float
    vitamin_e: Float
    vitamin_k: Float
    alpha_carotene: Float
    beta_carotene: Float
    chole: Float
    trans: Float
    water: Float
    clearWeights: [ProductClearWeight]
    measures: [ProductMeasure]
  }

  type Query {
    products: [Product]
    product(id: Int!): Product
  }

  type Mutation {
    createProduct(
      name: String!
      subname: String
      productCategory: String!
      kcal: Float
      protein: Float
      fat: Float
      carbohydrate: Float
      fiber: Float
      sugar: Float
      ash: Float
      starch: Float
      calcium: Float
      iron: Float
      magnesium: Float
      phosphorus: Float
      potassium: Float
      sodium: Float
      zinc: Float
      copper: Float
      manganese: Float
      selenium: Float
      vitamin_a: Float
      vitamin_b3: Float
      vitamin_b4: Float
      vitamin_b5: Float
      vitamin_b6: Float
      vitamin_b9: Float
      vitamin_c: Float
      vitamin_e: Float
      vitamin_k: Float
      alpha_carotene: Float
      beta_carotene: Float
      chole: Float
      trans: Float
      water: Float
    ): Product
  }
`;

module.exports = productTypeDefs;
