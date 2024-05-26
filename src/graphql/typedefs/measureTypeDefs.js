const { gql } = require('graphql-tag');

const measureTypeDefs = gql`
  type ProductMeasure {
    id: Int!
    productId: Int!
    name: String!
    value: Float!
    desc: String!
  }

  extend type Query {
    measures: [ProductMeasure]
    measure(id: Int!): ProductMeasure
  }

  extend type Mutation {
    createMeasure(
      productId: Int!
      name: String!
      value: Float!
      desc: String!
    ): ProductMeasure
  }
`;

module.exports = measureTypeDefs;
