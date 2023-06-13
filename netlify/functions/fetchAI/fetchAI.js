
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const handler = async (e) => {
  try {
    const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: e.body,
                presence_penalty: 0,
                frequency_penalty: 0
            })
    //const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        reply: response.data
       }),
       
    }
  } catch (error) {
    return { statusCode: 500 , body: JSON.stringify()}
  }

 
}

module.exports = { handler }


