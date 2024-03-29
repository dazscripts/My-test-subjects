const password = process.env.password
const key = process.env.aikey
const OpenAI = require('openai');
const openai = new OpenAI({apiKey: key});
const placeholder = "36214639"
const url = "https://kuiba.onrender.com/api/"
const imgprompt = process.env.imageprompt
const textprompt = process.env.textprompt
const http = require('https')
// b

async function moderateimage(id, pswrd, res) {
  if (pswrd === password) {console.log("correct password")} else {res.send("ACCESS DENIED")}
  //http.get(`${url}/bytecode/${id}-${pswrd}`)
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
    
      {
        role: "user",
        content: [
          {type: "text", text: imgprompt},
          //{type: "text", text: ""},
          {
            type: "image_url",
            image_url: {
              "url": `${url}storage/${id}.png`,
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0].message.content)
  res.send({
    input:`${url}storage/${id}`,
    passed:response.choices[0].message.content
  })
}

async function moderatetext(inputtext, pswrd, res) {
  if (pswrd === password) {console.log("correct fassword")} else {res.send("ACCESS DENIED")}
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role:"system",
        content:textprompt
      },
      {
        role: "user",
        content: inputtext
      },
    ],
  });
  res.send({
    input:inputtext,
    passed:response.choices[0].message.content
  })
}

module.exports.image = moderateimage
module.exports.text = moderatetext