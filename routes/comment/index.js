'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'http://127.0.0.1:6000/graphql'

module.exports = async function (fastify, opts) {
  fastify.get('/getComments', async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const query = gql`
    {
      allCommentsList(condition: {questionId: ${request.query.question_id}}, first:${request.query.total}, offset:${request.query.offset}, orderBy: CREATE_AT_DESC) {
        id
        userByUserId {
          id
          userName
        }
        content
        commentreactionsByCommentIdList (condition: {userId:${request.query.user_id}}) {
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

    const data = await graphQLClient.request(query)

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