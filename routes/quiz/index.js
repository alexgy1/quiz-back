'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const config = require('config');

const endpoint = config.get('endpoint.graphql.host');


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
          answersByQuestionIdList (filter: {userId: {equalTo: "${request.headers.user.id}"}}) {
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

  //getQuiz by id
  fastify.get('/getQuiz', async function (request, reply) {

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
    const id = request.query.quiz_id
    const query = gql`
    {
      quizById(id:${id}) {
        id
        title
        status
        isJudged
        endAt
        questionsByQuizIdList {
          id
          title
          createAt
          judge
          optionsByQuestionIdList {
            id
            title
          }
          answersByQuestionIdList(filter: {userId: {equalTo: "${request.headers.user.id}"}}) {
            optionId
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
      if(request.query.start && request.query.end) {
        filter = `, filter: {status: {equalTo: "closed"}, startAt: {`
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
  
    const query = gql`
    {
      allQuizzesList(first:${request.query.total}, offset:${request.query.offset}, orderBy: END_AT_DESC, ${filter}) {
        id
        title
        description
        startAt
        endAt
        isJudged 
        chipsByQuizIdList (condition: {
          userId: "${request.headers.user.id}" 
        }) {
            score
        }
      }
    }
  `
   const data = await graphQLClient.request(query)
   return data;
  });

}
