const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const prisma = new PrismaClient();

const schema = makeExecutableSchema({ typeDefs, resolvers });

const startServer = async () => {
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ prisma }),
  });

  await server.start();

  const app = express();
  app.use(bodyParser.json());

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
