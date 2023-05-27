// import { Configuration, OpenAIApi } from 'openai'
// import { process } from './env'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'

//

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// })

// const openai = new OpenAIApi(configuration)

const appSettings = {
    databaseURL: 'https://knowitall-openai-20c96-default-rtdb.firebaseio.com/'
}

const app = initializeApp(appSettings)

const database = getDatabase(app)

const conversationInDb = ref(database)

const chatbotConversation = document.getElementById('chatbot-conversation')

const instructionObj = 
    {
    role: 'system',
    content: 'You are an expert personal stylist who gives easy to follow style advice'

}



document.addEventListener('submit', (e) => {
    e.preventDefault()
    const userInput = document.getElementById('user-input')
    push(conversationInDb, {
        role: 'user',
        content: userInput.value
    })    
    fetchReply()
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})

async function fetchReply() {

    const url = 'https://style-sloth-chatbot.netlify.app/.netlify/functions/fetchAI'

    get(conversationInDb).then(async (snapshot) => {
        if(snapshot.exists()){
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)

            const respone = await fetchReply(url, {
                method:'POST',
                headers: {
                    'content-type': 'text/plain',
                },
                body: conversationArr
            })

            const data = await respone.json()
            console.log(data)
            
            // const response = await openai.createChatCompletion({
            //     model: 'gpt-3.5-turbo',
            //     messages: conversationArr,
            //     presence_penalty: 0,
            //     frequency_penalty: 0
            // })
            
            //push(conversationInDb, response.data.choices[0].message)
            //renderTypewriterText(response.data.choices[0].message.content)
        } else {
            console.log("no data available")
        }
    })
}

function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i-1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 50)
}

document.getElementById('clear-btn').addEventListener('click', () => {
    remove(conversationInDb) 
    chatbotConversation.innerHTML = `<div class="speech speech-ai">How can I help you?</div>`
})

function renderConversationFromDb() {
    get(conversationInDb).then(async (snapshot) => {
        if(snapshot.exists()){
            Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })

            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }
    })

}

renderConversationFromDb()

