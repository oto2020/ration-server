const { gql } = require('graphql-tag');

const clearWeightTypeDefs = gql`
  type ProductClearWeight {
    id: Int!
    productId: Int!
    name: String!
    value: Float!
    desc: String!
  }

  extend type Query {
    clearWeights: [ProductClearWeight]
    clearWeight(id: Int!): ProductClearWeight
  }

  extend type Mutation {
    createClearWeight(
      productId: Int!
      name: String!
      value: Float!
      desc: String!
    ): ProductClearWeight
  }
`;

module.exports = clearWeightTypeDefs;
