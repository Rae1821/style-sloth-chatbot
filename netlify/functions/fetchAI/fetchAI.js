
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    organization: "org-XC0s1PRokBlhgvcw6fyI5iQa",
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const handler = async (event) => {
  try {
    const response = await openai.ChatCompletion.create({
                model: 'gpt-3.5-turbo',
                messages: event.body,
                presence_penalty: 0,
                frequency_penalty: 0.3
            })
    //const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: response.data
       }),
       
    }
  } catch (error) {
    return { statusCode: 500 , body: error.toString()}
  }
}

module.exports = { handler }


