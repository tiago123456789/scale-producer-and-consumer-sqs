
module.exports.main = async (event, context, callback) => {
    console.log(JSON.parse(event.Records[0].body))
    callback(null, {})
};