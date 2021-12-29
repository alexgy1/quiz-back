'use strict'

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;
const schedule = require("node-schedule")
const config = require('config');

//schedule open and close related quiz
schedule.scheduleJob('0/1 * * * *', function(){
  console.log("schedule start ");
  enableQuiz();
  disableQuiz();
  judgeQuiz();
  console.log("schedule end ");
});

async function disableQuiz(){
  const graphQLClient = new GraphQLClient(endpoint, {
    mode: 'cors',
  })
  let date = new Date().toISOString();
  const disableQuiz = gql`
  {
    allQuizzesList(filter:{endAt:{lessThanOrEqualTo:"${date}"}}){
      id
    }
  }`
  let searchResult = await graphQLClient.request(disableQuiz);
  if(searchResult.allQuizzesList.length > 0){
    let gqls = `mutation{`;
    searchResult.allQuizzesList.forEach((quiz, index)=> {
        gqls += `c${index}: updateQuizById (input: {id :${quiz.id}, quizPatch: {status: "closed"}}){clientMutationId}`
      })
    gqls += `}`;
    let result = await graphQLClient.request(gqls);
    return result;
  }
  
}

async function enableQuiz(){
  const graphQLClient = new GraphQLClient(endpoint, {
    mode: 'cors',
  })
  let date = new Date().toISOString();
  console.log("date*****"+ date)
  const quiz = gql`
  {    
    allQuizzesList(
      filter:{
        startAt:{lessThanOrEqualTo:"${date}"}, 
        endAt:{greaterThan:"${date}"}, 
        isVerified:{equalTo: 1}
      }){
      id
    }
  }` 
  let searchResult = await graphQLClient.request(quiz);
  if(searchResult.allQuizzesList.length > 0){
    let gqls = `mutation {`;
    searchResult.allQuizzesList.forEach((quiz, index)=> {
        gqls += `c${index}: updateQuizById (input: {id :${quiz.id}, quizPatch: {status: "open"}}){clientMutationId}`
      })
    gqls += `}`;
    let result = await graphQLClient.request(gqls);
    return result;
  }
}

async function judgeQuiz(){
  const graphQLClient = new GraphQLClient(endpoint, {
    mode: 'cors',
  })
  const tojudgeQuizList = gql`
  {
    allQuizzesList(filter: {status:{equalTo: "closed"}, isJudged:{equalTo: 0}, isMarked:{equalTo: 1}}){
      id
      questionsByQuizIdList{
        id 
        score
        optionByJudge{
          id
          answersByOptionIdList{
            userId
          }
        }
      }
    }
  }`
  let searchResult = await graphQLClient.request(tojudgeQuizList);
  if(searchResult.allQuizzesList.length > 0){
    let createQuery = `mutation{`
    searchResult.allQuizzesList.forEach(function(quiz, quizIndex){
      quiz.questionsByQuizIdList.forEach(function(question, index){
        if(question.optionByJudge.answersByOptionIdList.length > 0){
          question.optionByJudge.answersByOptionIdList.forEach(function(answersByOptionId, answerIndex){
            createQuery += `c${quizIndex}${index}${answerIndex}:`;
            createQuery += `createChip(input: {chip:{questionId: ${question.id},`;
            createQuery += `quizId:${quiz.id},`;
            createQuery += `score:${question.score},`;
            createQuery += `userId:"${answersByOptionId.userId}",`;
            createQuery += `createAt:"${new Date().toISOString()}"}})`;
            createQuery += `{chip {questionId quizId score userId createAt}}`;
          });
        }
      });
      createQuery += `c${quizIndex}:updateQuizById(input: {id:${quiz.id}, quizPatch: {isJudged: 1}}){clientMutationId}`;
    });
    createQuery += `}`;
    const bulkInsert = gql`${createQuery}`;
    const updateChipResult = await graphQLClient.request(bulkInsert);
  }
}

const endpoint = config.get('endpoint.graphql.host');



// {
//   "id": 1,
//   "questionsByQuizIdList": [
//       {
//       "id": 1,
//       "judge": 1
//       },
//       {
//       "id": 2,
//       "judge": 3
//       },
//       {
//       "id": 3,
//       "judge": 5
//       }
//   ]
// }

module.exports = async function (fastify, opts) {
  //添加答案
  fastify.post('/judgement', {config: {
      rawBody: true
    }, 
    handler: async function(request, reply) {
      const graphQLClient = new GraphQLClient(endpoint, {
        mode: 'cors',
      })

      let quiz = JSON.parse(request.rawBody);
      let gqls = `{`;
      quiz.questionsByQuizIdList.forEach((question, index)=> {
        gqls += `c${index}: updateQuestionById (input: {id :${question.id}, questionPatch: {judge: ${question.judge}}}){clientMutationId}`
      });
      gqls += `updateQuizById(input: {id: ${quiz.id}, quizPatch: {isJudged: 1}}){clientMutationId}}`;
      console.log(gqls)
      graphQLClient.setHeader('X-Mutation-Atomicity', 'on');
      const data = await graphQLClient.request(gql`mutation ${gqls}`);
      return data
    }
})
// {
//   "quizById": {
//       "title": "TestEuroCup1",
//       "description": "null",
//       "banner": "null",
//       "startAt": "2021-12-23T16:00:00+00:00",
//       "endAt": "2021-12-24T06:00:00+00:00",
//       "questionsByQuizIdList": [
//       {
//           "title": "Who will win the match between  Wales VS Denmark Will there be overtime in the match Wales VS Denmark ?",
//           "judge": 5,
//           "score": 1,
//           "optionsByQuestionIdList": [
//           {
//               "title": "Denmark"
//           },
//           {
//               "title": "Wales"
//           }
//           ]
//       }
//       ]
//   }
// }

//创建quiz
  fastify.post('/create', {config: {rawBody: true}, handler: async function(request, reply) {
    const graphQLClient = new GraphQLClient(endpoint, {mode: 'cors',})
    
    let quiz = JSON.parse(request.rawBody).quizById;
    let currendDate = new Date().toISOString();
    let errMessage = {errorKey: 'date invalid'};
    console.log(quiz.startAt < currendDate)
    console.log(quiz.endAt < currendDate )
    console.log(quiz.startAt < quiz.endAt)
    if(quiz.startAt < currendDate || quiz.endAt < currendDate || quiz.startAt > quiz.endAt){
      return JSON.stringify(errMessage);
    }
    let createQuery = `mutation{`
    createQuery += `createQuiz (input: {
      quiz: {
        title: "${quiz.title}", 
        description: "${quiz.description}",
        banner: "${quiz.banner}",
        status: "created", 
        createAt: "${quiz.startAt}",
        endAt: "${quiz.endAt}",
        isMarked: 0,
        isVerified: 0,
        isJudged: 0,`;
    createQuery += `questionsUsingId:{create:[`;
    quiz.questionsByQuizIdList.forEach(function(question, questionId){
      createQuery += `{title: "${question.title}", createAt: "${new Date().toISOString()}", score: ${question.score},`;
      createQuery += `optionsUsingId:{create:[`;
      question.optionsByQuestionIdList.forEach(function(option, optinIndex){
        createQuery += `{title:"${option.title}"}`;
      });
      createQuery += `]}}`;
    });
    createQuery += `]}}}){quiz {id}}}`;
    graphQLClient.setHeader('X-Mutation-Atomicity', 'on');
    const data = await graphQLClient.request(createQuery)
    return data
  }
  })
  
// {
//     "quizId": 405
// }
//审批quiz
  fastify.post('/verify', {config: {
      rawBody: true
    }, 
    handler: async function(request, reply) {
      const graphQLClient = new GraphQLClient(endpoint, {
        mode: 'cors',
      })

      let quiz = JSON.parse(request.rawBody);
      const quizStatus = gql`{
        quizById(id: ${quiz.quizId}){
          status
          startAt
        }
      }`
      let currendDate = new Date().toISOString();
      const statusData = await graphQLClient.request(quizStatus);
      if(statusData.quizById.status == "created" && statusData.quizById.startAt > currendDate){
        const verifyQuiz = gql`
        mutation{
          updateQuizById(input: {id: ${quiz.quizId}, quizPatch: {isVerified: 1}}){
            clientMutationId
          }
        }`
        const data = await graphQLClient.request(verifyQuiz)
        return data
      }
      return '';
    }
  })
}