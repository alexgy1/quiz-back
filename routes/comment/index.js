'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const config = require('config');

const endpoint = config.get('endpoint.graphql.host');

module.exports = async function (fastify, opts) {
  fastify.post('/addComment', {config: {
    rawBody: true},
    handler: async function(request, reply) {
      let json = JSON.parse(request.rawBody);
      const graphQLClient = new GraphQLClient(endpoint, {
        mode: 'cors',
      })

      
      let mutation = gql`mutation {
        createComment (input: {comment: {userId: "${request.headers.user.id}", content:"""${json.content}""", 
          questionId: ${json.questionId}, likes: 0, dislikes:0}}) {
          comment {
            id 
            userByUserId {id, userName}
            content
            createAt
            likes
            dislikes
            reply
            commentreactionsByCommentIdList (condition:{userId: "${request.headers.user.id}"}) {
              reactionType
              id
            }
          }
      }}`
      
      try {
        const data = await graphQLClient.request(mutation)
        return data;
      }
      catch(err) {
        return { message: 'error while posting comment' } 
      }
    }
  });
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
        commentreactionsByCommentIdList (condition: {userId:"${request.headers.user.id}"}) {
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

  fastify.post('/addLikeComment', {config: {
    rawBody: true},
    handler: async function(request, reply) {
      let json = JSON.parse(request.rawBody);
      const graphQLClient = new GraphQLClient(endpoint, {
        mode: 'cors',
      })
    
      const mutation = gql`
      mutation {
        createCommentreaction(input: {commentreaction: {userId: "${request.headers.user.id}", reactionType: 2, commentId: ${json.commentId}}}) {
          commentreaction {id, userId, reactionType, commentId}
        }
      }
    `

      const data = await graphQLClient.request(mutation)

      return data;
  }});



  fastify.post('/addDislikeComment', {config: {
    rawBody: true},
    handler: async function(request, reply) {
      let json = JSON.parse(request.rawBody);
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    mutation {
      createCommentreaction(input: {commentreaction: {userId: "${request.headers.user.id}", reactionType: 1, commentId: ${json.commentId}}}) {
        commentreaction {id, userId, reactionType, commentId}
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  }});


  fastify.post('/removeLikeComment', {config: {
    rawBody: true},
    handler: async function(request, reply) {
      let json = JSON.parse(request.rawBody);
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    mutation {
      deleteCommentreactionById (input: {id: ${json.reactionId}}) {
        deletedCommentreactionId 
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  }});


  fastify.post('/removeDislikeComment', {config: {
    rawBody: true},
    handler: async function(request, reply) {
      let json = JSON.parse(request.rawBody);
    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const mutation = gql`
    mutation {
      deleteCommentreactionById (input: {id: ${json.reactionId}}) {
        deletedCommentreactionId 
      }
    }
  `

    const data = await graphQLClient.request(mutation)

    return data;
  }});
  
}