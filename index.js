import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'


const appSettings = {
    databaseURL: 'https://stylist-chatbot-default-rtdb.firebaseio.com/'
}

const app = initializeApp(appSettings)

const database = getDatabase(app)

const conversationInDb = ref(database)

const chatbotConversation = document.getElementById('chatbot-conversation')


const instructionObj = 
    {"role": "system", "content": "You are an expert personal stylist who gives easy to follow fashion advice"}
    // {"role": "user", "content": "What should I wear to a cocktail party?"},
    // {"role": "system", "content": "A little black dress will give you a classic look that is perfect for any situation. Pair it with some black heels and black clutch to keep the classic look going or add some color to your shoes or handbag for a more youthful vibe"},
    // {"role": "user", "content": "What kind of jewelry should I wear?"}


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



function fetchReply() {

    get(conversationInDb).then(async (snapshot) => {
        if (snapshot.exists()) {
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)
    
            const url = 'https://style-sloth-chatbot.netlify.app/.netlify/functions/fetchAI'
            
            const response = await fetch(url, {
                method:'POST',
                headers: {
                    'content-type': 'text/plain',
                },
                body: conversationArr,
            })
            
            push(conversationInDb, response.data.choices[0].message)
            renderTypewriterText(response.data.choices[0].message.content)
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
    chatbotConversation.innerHTML = `<div class="speech speech-ai">What can I help you style?</div>`
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

