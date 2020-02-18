import { environment } from '../../../../../apps/stocks-api/src/environments/environment';
import * as Joi from 'joi';

const got = require('got');

const pluginName = 'stocksPlugin';

const getStockPrices = async (symbol) => {
    // Set period to max to retrieve all the closing prices for a given stock symbol
    // to avoid needing to make multiple requests for a single symbol.
    const PERIOD = 'max';

    // Create url for retrieving all stock prices for the provided symbol
    const URL = `${environment.apiURL}/beta/stock/${symbol}/chart/${PERIOD}?token=${environment.apiKey}`;
    
    // Request stock prices by symbol and time period
    try {
        const RESPONSE = await got(URL, {responseType: 'json'});
        return RESPONSE.body;
    } catch(error) {
        console.error('An error occurred retrieving stock prices for key: ' + symbol);
        return [];
    }
};

const handleError = function (request, h, err) {

    // Log error if we have error details
    if (err.isJoi && Array.isArray(err.details) && err.details.length > 0) {
       console.log('Unable to process request:', err.details[0].message);
    }

    // Return empty array to ensure UI informs the user that no data was found
    return h.response([])
            .code(200)
            .takeover();
};

export const StocksPlugin = {
    name: pluginName,
    version: '1.0.0',
    once: true,
    register: async function(server) {

        // Use CatboxMemory to create 'stocks' cache
        await server.cache.provision({ 
            provider: require('@hapi/catbox-memory'),
            name: 'stocks'
        });

        // Configure 'stocks' cache with 'closing_prices' partition.
        // Expires every 30 secs for easy testing.
        const cache = server.cache({ 
            cache: 'stocks', 
            expiresIn: 30 * 1000,
            segment: 'closing_prices',
            generateFunc: async (id: string) => {
                // Leaving in console log for easy testing
                console.log('NO CACHE FOUND');
                return await getStockPrices(id);
            },
            generateTimeout: 10 * 1000
        });

        server.route({
            method: 'GET',
            path: '/api/beta/stock/{symbol}',
            handler: async (request, h) => {
                // Grab the stock symbol from path and use it as our cache key
                const ID = request.params.symbol;

                // Retrieve stock prices
                try {
                    return await cache.get(ID);
                } catch (error) {
                    console.error('Unable to process request due to invalid symbol: ' + ID);
                    return [];
                } 
            },
            options: {
                validate: {
                    params: Joi.object({
                        symbol: Joi.string().min(1).max(5).required()
                    }),
                    failAction: handleError
                }
            }
        });
    }
};


