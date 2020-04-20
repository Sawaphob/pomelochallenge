'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../index');

describe('GET /', () => {
    let server;

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('Query first page', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).contain('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=1')
    });
    it('Query page ten', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/?page=10'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).contain('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=10')
    });
    it('Query last page', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/?page=100'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).contain('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=100')
    });
    it('Query negative page', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/?page=-20'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).contain('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=1')
    });
    it('Query >= 100 page', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/?page=130'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).contain('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=100')
    });

});

describe('POST /tree', () => {
    let server;

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });
    it('Do not have any data', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/tree',
            payload:
                { "0": [], }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).equal([])
        //console.log(res.result)
    });
    it('Only root node', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/tree',
            payload:
            {
                "0": [{
                    "id": 10,
                    "title": "House",
                    "level": 0,
                    "children": [],
                    "parent_id": null
                }],
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).equal([{
            "id": 10,
            "title": "House",
            "level": 0,
            "children": [],
            "parent_id": null
        }])
        //console.log(res.result)
    });
    it('Sample node', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/tree',
            payload:
            {
                "0": [{
                    "id": 10,
                    "title": "House",
                    "level": 0,
                    "children": [],
                    "parent_id": null
                }],
                "1":
                    [{
                        "id": 12,
                        "title": "Red Roof",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    },
                    {
                        "id": 18,
                        "title": "Blue Roof",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    },
                    {
                        "id": 13,
                        "title": "Wall",
                        "level": 1,
                        "children": [],
                        "parent_id": 10
                    }],
                "2":
                    [{
                        "id": 17,
                        "title": "Blue Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 12
                    },
                    {
                        "id": 16,
                        "title": "Door",
                        "level": 2,
                        "children": [],
                        "parent_id": 13
                    },
                    {
                        "id": 15,
                        "title": "Red Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 12
                    }]
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).equal([{
            "id": 10,
            "title": "House",
            "level": 0,
            "children":
                [{
                    "id": 12,
                    "title": "Red Roof",
                    "level": 1,
                    "children":
                        [{
                            "id": 17,
                            "title": "Blue Window",
                            "level": 2,
                            "children": [],
                            "parent_id": 12
                        },
                        {
                            "id": 15,
                            "title": "Red Window",
                            "level": 2,
                            "children": [],
                            "parent_id": 12
                        }],
                    "parent_id": 10
                },
                {
                    "id": 18,
                    "title": "Blue Roof",
                    "level": 1,
                    "children": [],
                    "parent_id": 10
                },
                {
                    "id": 13,
                    "title": "Wall",
                    "level": 1,
                    "children":
                        [{
                            "id": 16,
                            "title": "Door",
                            "level": 2,
                            "children": [],
                            "parent_id": 13
                        }],
                    "parent_id": 10
                }],
            "parent_id": null
        }])
        //console.log(res.result)
    });
    it('2 root node', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/tree',
            payload:
            {
                "0": [{
                    "id": 10,
                    "title": "House",
                    "level": 0,
                    "children": [],
                    "parent_id": null
                },
                {
                    "id": 12,
                    "title": "Red Roof",
                    "level": 0,
                    "children": [],
                    "parent_id": null
                }],
                "1":
                    [
                        {
                            "id": 18,
                            "title": "Blue Roof",
                            "level": 1,
                            "children": [],
                            "parent_id": 10
                        },
                        {
                            "id": 13,
                            "title": "Wall",
                            "level": 1,
                            "children": [],
                            "parent_id": 12
                        }],
                "2":
                    [{
                        "id": 17,
                        "title": "Blue Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 13
                    },
                    {
                        "id": 16,
                        "title": "Door",
                        "level": 2,
                        "children": [],
                        "parent_id": 13
                    },
                    {
                        "id": 15,
                        "title": "Red Window",
                        "level": 2,
                        "children": [],
                        "parent_id": 18
                    }]
            }
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).equal([
            {
                "id": 10,
                "title": "House",
                "level": 0,
                "children": [
                    {
                        "id": 18,
                        "title": "Blue Roof",
                        "level": 1,
                        "children": [
                            {
                                "id": 15,
                                "title": "Red Window",
                                "level": 2,
                                "children": [],
                                "parent_id": 18
                            }
                        ],
                        "parent_id": 10
                    }
                ],
                "parent_id": null
            },
            {
                "id": 12,
                "title": "Red Roof",
                "level": 0,
                "children": [
                    {
                        "id": 13,
                        "title": "Wall",
                        "level": 1,
                        "children": [
                            {
                                "id": 17,
                                "title": "Blue Window",
                                "level": 2,
                                "children": [],
                                "parent_id": 13
                            },
                            {
                                "id": 16,
                                "title": "Door",
                                "level": 2,
                                "children": [],
                                "parent_id": 13
                            }
                        ],
                        "parent_id": 12
                    }
                ],
                "parent_id": null
            }
        ])
    });
    it('Incorrect JSON structure', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/tree',
            payload:
            {
                "0": [{
                    "id": 10,
                    "title": "House",
                    "level": 0,
                    "children": [],
                    "parent_id": null
                }],
                "1":
                    [{
                        "id": 12,
                        "title": "Red Roof",
                        "level": 1,
                        "children": [],
                        "parent_id": 9
                    }
            ]}
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).equal("Please check input")
    });

});