'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const config = require('config');

const endpoint = config.get('endpoint.graphql.host');
console.log(endpoint)

module.exports = async function (fastify, opts) {
  fastify.get('/getWeekRank', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
    
    let start = new Date();
    start.setDate(start.getDate()-7)
    start = start.toISOString();
    let end = new Date().toISOString();

    const mutation = gql`
    {
      rankingsList(total: ${request.query.total}, _offset: ${request.query.offset}, _begin: "${start}", _end:"${end}") {
        score
        userId
        userName
      }
    }
  `
    const data = await graphQLClient.request(mutation)
    return data;
  })

  fastify.get('/getAllRank', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    {
      allrankingList(total: ${request.query.total}, _offset: ${request.query.offset}) {
        score
        userId
        userName
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  })
}