require("dotenv").config({ path: ".env" })

const { Consumer } = require('sqs-consumer');
const AWS = require("aws-sdk")

const credentials = new AWS.SharedIniFileCredentials({ profile: 'default'});
AWS.config.credentials = credentials;

const ses = new AWS.SES(
    {
        region: "us-east-1"
    }
)

const sendEmail = async (data) => {
    console.log(`>>> ${new Date().toISOString()} | Sending email`)
    await ses.sendEmail({
        Source: "tiagorosadacost@gmail.com",
        Destination: {
            ToAddresses: [data.to],
        },
        Message: {
            Subject: {
                Data: "Test"
            },
            Body: {
                Text: {
                    Data: data.message
                }
            }
        }
    }).promise()
    console.log(`>>> ${new Date().toISOString()} | Sended email`)
}

const app = Consumer.create({
    queueUrl: process.env.QUEUE,
    handleMessage: async (message) => {
        const data = JSON.parse(message.Body)
        sendEmail(data);
    }
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

app.start();