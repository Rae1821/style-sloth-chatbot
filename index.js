import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'


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

            const response = await fetch(url, {
                method:'POST',
                headers: {
                    'content-type': 'text/plain',
                },
                body: conversationArr
            })

            const data = await response.json()
            console.log(data)
            
            push(conversationInDb, data.reply.choices[0].message)
            renderTypewriterText(data.reply.choices[0].message.content)

    get(conversationInDb).then( (snapshot) => {
        if(snapshot.exists()){
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)
        } 
        else {
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

