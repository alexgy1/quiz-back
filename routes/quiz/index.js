'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'http://90.84.178.156:3001/graphql'


module.exports = async function (fastify, opts) {
  fastify.get('/getOpenQuizs', async function (request, reply) {

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })

    const query = gql`
    {
      allQuizzesList(filter: {status: {equalTo: "open"}} ,orderBy: END_AT_ASC) {
        id
        title
        banner
        description
        startAt
        endAt
        questionsByQuizIdList {
          answersByQuestionIdList (filter: {userId: {equalTo: 123}}) {
            id
          }
        }
      }
    }
    `
    try {
      const data = await graphQLClient.request(query)
      return data
    } catch (error) {
      return error
    }
  });

  //getQuizs
  fastify.get('/getQuizs', async function(request, reply) {

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })

    let filter = ``;
      if(request.query.start || request.query.end) {
        filter = `, filter: {status: {equalTo: "closed"}, endAt: {`
        let hasStart = false;
        if(request.query.start) {
          hasStart = true;
          filter += `greaterThanOrEqualTo: "${request.query.start}"`
        }
        if(request.query.end) {
          if(hasStart) {
            filter += `,`
          }
          filter += `lessThanOrEqualTo: "${request.query.end}"`
        }
        filter += `}}`
      } else {
        filter += `, filter: {status: {equalTo: "closed"}}`
    }
  
    const mutation = gql`
    {
      allQuizzesList(first:20, offset:0, orderBy: END_AT_DESC, ${filter}) {
        id
        title
        description
        startAt
        endAt
        isMarked
        chipsByQuizIdList (condition: {
          userId: 109
        }) {
            score
        }
      }
    }
  `

  const variables = {
    total: 10,
    offset: 0,
  }

  const data = await graphQLClient.request(mutation)

  console.log(JSON.stringify(data, undefined, 2))
    return data;
  });

  fastify.get('/getQuiz', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    {
      quizById(id:${request.query.id}) {
        id
        title
        status
        questionsByQuizIdList {
          id
          title
          createAt
          judge
          optionsByQuestionIdList {
            id
            title
          }
          answersByQuestionIdList(filter: {userId: {equalTo: 123}}) {
            optionId
          }
        }
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  })

}
