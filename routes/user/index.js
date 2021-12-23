'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const userVerfiy = require('../../service/user_service')


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
    reply.header('set-cookie', "token="+token+";path=/")
    reply.redirect(302, 'http://90.84.178.156:3000')
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
        gqls += `answer: {questionId: ${question.id}, optionId: ${optionId}, userId: "${request.query.offset}", createAt: "${new Date().toISOString()}"}`
        gqls += `}) {answer {questionId optionId userId createAt}}`
      });
      gqls += "}"

      const data = await graphQLClient.request(gql`mutation ${gqls}`)
      return data
    }
  })
}