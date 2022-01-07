const fs                = require('fs');
const { DateTime }      = require("luxon");
const csv               = require('csv-parser')
const logger            = require('devbricksx-js').logger;

const INPUT_FILE = 'input-file';
const DAYS = 'days';
const START_DATE = 'start-date';
const START_DATE_FORMAT = 'yyyy-mm-dd';

const OPTION_COLS = ['A', 'B', 'C'];

let argv = require('minimist')(process.argv.slice(2),{});
console.log('application arguments:');
console.dir(argv);
console.log();

logger.enableDebugOutputs(argv);

if (!argv[INPUT_FILE]) {
    logger.error(`${INPUT_FILE} is missing`);
    process.exit(1);
}

let startDate = DateTime.now().startOf('day');
if (argv[START_DATE] && typeof argv[START_DATE] === 'string') {
    startDate = DateTime.fromFormat(argv[START_DATE], START_DATE_FORMAT);
    if (!startDate.isValid) {
        logger.error(`invalid format of date: ${argv[START_DATE]}. It should be in format [${START_DATE_FORMAT}].`);
        process.exit(1);
    }
}
logger.info(`quizzes start date: [${startDate}]`);

const inputFile = argv[INPUT_FILE];
logger.info(`extracting quiz from file: [${inputFile}]`);
if (!fs.existsSync(inputFile)) {
    logger.error(`${inputFile} does NOT existed.`);
    process.exit(1);
}

let quizzesStartDate = startDate;
let day = -1;
let question = 0;
let quiz = null;
let quizzes = [];
fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', function (row) {
        if (row.Date !== "") {
            day++;
            question = 0;

            if (quiz !== null) {
                quizzes.push(quiz);
            }

            quiz = {};
            quiz.title = `Quiz of Day ${day}`;
            quiz.description = null;
            quiz.banner = null;
            quiz.questionsByQuizIdList = [];
        }

        logger.debug(`processing [Day: ${day}, Question: ${question}: ${JSON.stringify(row)}`);

        let questionOfQuiz = {
            title: row['Questions'],
            score: 1,
            optionsByQuestionIdList: []
        }

        for (let c of OPTION_COLS) {
            logger.debug(`find option[${c}]: ${JSON.stringify(row[c])}`);

            if (!row[c]) {
                break;
            }

            questionOfQuiz.optionsByQuestionIdList.push({
                title: row[c]
            })
        }

        quiz.questionsByQuizIdList.push(questionOfQuiz);

        question++;
    })
    .on('end', function () {
        if (quiz != null) {
            quizzes.push(quiz);
        }

        let output = {

        }

        if (argv[DAYS]) {
            let typeOfArg = typeof argv[DAYS];
            logger.debug(`days: ${argv[DAYS]} [${typeOfArg}]`);

            let days = [];
            if (typeOfArg === 'number') {
                days.push(parseInt(argv[DAYS]));
            } else if (typeOfArg === 'string') {
                argv[DAYS].split(',')
                    .map(s => parseInt(s.trim()))
                    .forEach(day => days.push(day));
            }

            output.quizById = [];
            for (let i = 0; i < quizzes.length; i++) {
                if (days.includes(i)) {
                    output.quizById.push(quizzes[i]);
                }
            }
        } else {
            output.quizById = quizzes;
        }

        let date = quizzesStartDate;
        for (let q of output.quizById) {
            q.startAt = date.toISO();
            q.endAt = date.plus({day: 1}).toISO();

            date = date.plus({day: 1});
        }

        logger.info(`${JSON.stringify(output, null, 2)}`);
    });

