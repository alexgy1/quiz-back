'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'http://90.84.178.156:3001/graphql'

module.exports = async function (fastify, opts) {


  fastify.get('/user', async function(request, reply) {
    
  })

  fastify.post('/submitAnswers', {config: {
      rawBody: true
    }, 
    handler: async function(request, reply) {
      const graphQLClient = new GraphQLClient(endpoint, {
        mode: 'cors',
      })

      let json = JSON.parse(request.rawBody);

      let gqls = "{";
      json.questionsByQuizIdList.forEach((question, index)=> {
        gqls += `c${index}: createAnswer (input: {`
        let optionId = question.answersByQuestionIdList[0].optionId;
        gqls += `answer: {questionId: ${question.id}, optionId: ${optionId}, userId: 123, createAt: "${new Date().toISOString()}"}`
        gqls += `}) {answer {questionId optionId userId createAt}}`
      });
      gqls += "}"

      const data = await graphQLClient.request(gql`mutation ${gqls}`)
      return data
    }
  })
}