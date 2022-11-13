const fs = require("fs")

const messages = []
for (let index = 0; index < 1000000; index++) {
    messages.push({
        teste: `teste${index}`
    })
}

fs.writeFileSync("fake.json", JSON.stringify(messages))