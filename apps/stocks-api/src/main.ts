/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { StocksPlugin } from '@coding-challenge/hapi/stocks';


const init = async () => {

  // Create HAPI server on localhost:3333
  const server = new Server({
    port: 3333,
    host: 'localhost'
  });
  
  // Default route
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        hello: 'world'
      };
    }
  });

  // Register stocks plugin which contains the API route
  // for the stock prices retrieval and caching.
  await server.register(StocksPlugin);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
