const fs = require("fs")

const messages = []
for (let index = 0; index < 100000; index++) {
    messages.push({
        to: `teste${index}@gmail.com`,
        message: `teste${index}`
    })
}

fs.writeFileSync("fake.json", JSON.stringify(messages))