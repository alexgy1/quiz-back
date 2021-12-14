'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'http://90.84.178.156:3001/graphql'

module.exports = async function (fastify, opts) {
  fastify.get('/getComments', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    {
      allCommentsList(condition: {questionId: ${request.query.questionId}}, first:${request.query.total}, offset:${request.query.offset}, orderBy: CREATE_AT_DESC) {
        id
        userByUserId {
          id
          userName
        }
        content
        commentreactionsByCommentIdList (condition: {userId:${request.query.id}}) {
          reactionType,
          id
        }
        likes
        dislikes
        reply
         createAt
        updateAt
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  })

  fastify.get('/createCommentreaction', async function(request, reply) {

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    mutation {
      createCommentreaction (input: {commentreaction: {userId: 123, reactionType: 2, commentId: 1011}}) {
        commentreaction {id, userId, reactionType, commentId}
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  });
}