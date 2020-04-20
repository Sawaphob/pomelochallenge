'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const HapiSwagger = require('hapi-swagger');
const Joi = require('@hapi/joi')
const swaggerOptions = {
    info: {
        title: 'Pomelo Challenge API Documentation',
        version: '0.0.1',
    }
};
const inputDataModel_Parent = Joi.array().items(Joi.object().keys({
    id: Joi.number(),
    title: Joi.string(),
    level: Joi.number(),
    children: Joi.array().items(Joi.object()),
    parent_id: Joi.allow(null)
})).optional()
const inputDataModel = Joi.array().items(Joi.object().keys({
    id: Joi.number(),
    title: Joi.string(),
    level: Joi.number(),
    children: Joi.array().items(Joi.object()),
    parent_id: Joi.number()
})).optional()
//function for calculate json data
const calculate_tree = (data) => {
    const treeMap = new Map()
    const returnValue = []
    //data is user input
    //for loop in user input
    Object.keys(data).forEach(function (key) {
        //for loop in each key tp get node
        data[key].forEach(function (node) {
            //Assign node to map
            treeMap[node.id] = node
            //Check that node does not root
            if (typeof node.parent_id === 'number') {
                //Push data into parent node
                treeMap[node.parent_id].children.push(node)
            }
        })
    });
    //Incase there are more than one root node
    data["0"].forEach(function (root_node) {
        returnValue.push(treeMap[root_node.id])
    })
    return returnValue;
}

const init = async () => {
    //Create Hapi Server
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });
    //Register the lib and configuration
    await server.register(require('@hapi/vision'));
    await server.register([Inert, { plugin: HapiSwagger, options: swaggerOptions }
    ]);
    //create views for frontend
    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'views'
    });
    //Route to access github data table (Task 2)
    server.route({
        method: 'GET',
        path: '/',
        options: {
            description: `Get repository from github with "nodejs"`,
            notes: 'Returns html with data table',
            tags: ['api'],
            validate: {
                query: Joi.object({
                    page: Joi.number()
                }),
            },
            handler: (request, h) => {
                //Get page number from query (Request template : /?page=x)
                var page = request.query.page
                //If doesn't have params, get page=1
                if (typeof (page) === 'undefined') {
                    page = '1'
                    //Github API limit only 1000 first result so 10 items each page, we have max 100 pages.
                } else if (page > 100) {
                    page = '100'
                    //Handle for negative page
                } else if (page < 1) {
                    page = '1'
                }
                return h.view('index', { page: page });
            }
        }
    });
    //Route for task 1
    server.route({
        method: 'POST',
        path: '/tree',
        options: {
            description: `JSON Convertion`,
            notes: 'Returns json in Appendix 2 Output format',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    0: inputDataModel_Parent,
                    1: inputDataModel,
                    2: inputDataModel
                })
            },

            handler: (request, h) => {
                //get data from user input
                const data = request.payload
                try {
                    return calculate_tree(data)
                } catch {
                    return "Please check input"
                }
            }
        }
        });
    return server
};
const start = async () => {
    const server = await init()
    await server.start();
    console.log('Server running on %s', server.info.uri);
}

start()
exports.init = init;