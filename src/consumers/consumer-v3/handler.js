const AWS = require("aws-sdk")

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

module.exports.main = async (event, context, callback) => {
    const data = JSON.parse(event.Records[0].body);
    console.log(data)
    await sendEmail(data)
    callback(null, {})
};