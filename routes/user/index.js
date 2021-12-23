'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const userVerfiy = require('../../service/user_service')
const config = require('config');


const endpoint = 'http://90.84.178.156:3001/graphql'

const createUserIfNotExist = async (user) => {
  const graphQLClient = new GraphQLClient(endpoint, {
    mode: 'cors',
  })

  const mutation = gql`
  {
    createuserifnotexist (input: {_userid: "${user.id}", _email:"${user.email}", _username: "${user.email}"})  {
      results {id userName userEmail}
    }
  }`

  const data = await graphQLClient.request(gql`mutation ${mutation}`)
  return data
}

module.exports = async function (fastify, opts) {
  //https://authentication.orangelabschina.cn:1805/Login?client_id=winterolympic2022&client_secret=fqOOLBk8NmpdAYaTln5uLbBkhU6FPwNMQAvp8BwttRDUuTTSS6K_y-_f4N9XuUNh&theme=light&privacyPolicy=http://google.com

  fastify.get('/login', async function(request, reply) {
    
    let token = request.query.token
    let user = await userVerfiy.verifyToken(request.query.token, false)
    if(user) {
      createUserIfNotExist(user)
    } 
    reply.header('set-cookie', "orange_quiz_token="+token+";path=/;expires=2147483647")
    const frontendHost = config.get('endpoint.frontend.host');
    reply.redirect(302, frontendHost)
  })

  fastify.get('/getUser', async function(request, reply) {
    let id = request.headers.user.id;

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
  
    const query = gql`
    {
      userById(id: "${id}") {
        id
        userName
        email
      }
    }
  `
    const data = await graphQLClient.request(query)
    return data;
  })

  fastify.post('/updateUser', {config: {
      rawBody: true
    }, 
    handler: async function(request, reply) {
    let id = request.headers.user.id;

    const graphQLClient = new GraphQLClient(endpoint, {
      mode: 'cors',
    })
    
    let json = JSON.parse(request.rawBody);
    console.log(json);
    const mutation = gql`
    mutation { updateUserById(input: {id: "${request.headers.user.id}", userPatch: {userName: "${json.userName}"}}) {
        user {
          userName
        }
      }
    }`

    try {
      const data = await graphQLClient.request(mutation)
      return data;
    }
    catch(err) {
      if (err.response && err.response.errors && err.response.errors[0] 
          && err.response.errors[0].message && err.response.errors[0].message.startsWith("duplicate key value violates")) {
            reply.statusCode = 400
            console.log("username is used")
            return { message: 'Username\'s already token, please choose another name' }
      }
    }
    
  }})

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
        gqls += `answer: {questionId: ${question.id}, optionId: ${optionId}, userId: "${request.headers.user.id}", createAt: "${new Date().toISOString()}"}`
        gqls += `}) {answer {questionId optionId userId createAt}}`
      });
      gqls += "}"

      console.log(gqls)
      const data = await graphQLClient.request(gql`mutation ${gqls}`)
      return data
    }
  })
}