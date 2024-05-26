const { gql } = require('apollo-server');
const productTypeDefs = require('./productTypeDefs');
const clearWeightTypeDefs = require('./clearWeightTypeDefs');
const measureTypeDefs = require('./measureTypeDefs');

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

module.exports = [baseTypeDefs, productTypeDefs, clearWeightTypeDefs, measureTypeDefs];
