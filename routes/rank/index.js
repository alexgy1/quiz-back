'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'http://90.84.178.156:3001/graphql'

module.exports = async function (fastify, opts) {
  fastify.get('/getWeekRank', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    {
      rankingsList(total: ${request.query.total}, _offset: ${request.query.offset}, _begin: "${request.query.begin}", _end:"${request.query.end}") {
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