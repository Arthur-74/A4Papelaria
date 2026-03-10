// DOM Elements
const chatWidget = document.getElementById('chat-widget');
const floatingBtn = document.getElementById('floating-chat-btn');
const messagesContainer = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

// State Machine
let currentState = 'START'; 
// States: START, CLASSIFYING, COLLECTING_IMPRESSAO, COLLECTING_ORCAMENTO, COLLECTING_PESQUISA, END

let currentCategory = '';
let collectedData = '';

// Regex/Keywords for Intent Classification
const keywords = {
    impressao: /imprimi|impressão|xerox|cópia|pdf|encadernação|encaderna/i,
    orcamento: /orçamento|material|preço|lista|escolar|escritório|quanto custa/i,
    pesquisa: /tem |vende|procuro|busco|caderno|caneta|possui|vocês têm/i
};

// Toggle Chat Widget
function toggleChat() {
    if (chatWidget.classList.contains('hidden')) {
        openChat();
    } else {
        closeChat();
    }
}

function openChat() {
    chatWidget.classList.remove('hidden');
    floatingBtn.style.display = 'none';
    
    // Initialize chat if empty
    if (messagesContainer.children.length === 0) {
        setTimeout(() => {
            addBotMessage("Olá! Sou o assistente virtual da A4 Papelaria 👋");
            setTimeout(() => {
                addBotMessage("Como posso ajudar você hoje?");
                currentState = 'CLASSIFYING';
            }, 600);
        }, 300);
    }
    
    userInput.focus();
}

function closeChat() {
    chatWidget.classList.add('hidden');
    floatingBtn.style.display = 'flex';
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add User Message
    addUserMessage(text);
    userInput.value = '';

    // Process Message
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processState(text);
    }, 800 + Math.random() * 500); // Simulate typing delay
}

function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function addBotMessage(text, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    if (isHtml) {
        msgDiv.innerHTML = text;
    } else {
        msgDiv.textContent = text;
    }
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot typing-indicator';
    msgDiv.id = 'typing';
    msgDiv.innerHTML = '<span style="opacity:0.6">Digitando...</span>';
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing');
    if (typing) {
        typing.remove();
    }
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Logic flow
function processState(text) {
    switch (currentState) {
        case 'CLASSIFYING':
            classifyIntent(text);
            break;
        case 'COLLECTING_IMPRESSAO':
            collectedData = text;
            currentCategory = 'Impressão de documentos';
            finishFlow();
            break;
        case 'COLLECTING_ORCAMENTO':
            collectedData = text;
            currentCategory = 'Orçamento de materiais';
            finishFlow();
            break;
        case 'COLLECTING_PESQUISA':
            collectedData = text;
            currentCategory = 'Pesquisa de produtos';
            finishFlow();
            break;
        case 'END':
            addBotMessage("Se precisar de mais alguma coisa, basta atualizar a página ou iniciar uma nova conversa.");
            break;
    }
}

function classifyIntent(text) {
    if (keywords.impressao.test(text)) {
        currentState = 'COLLECTING_IMPRESSAO';
        addBotMessage("Entendi! Você precisa de serviços de impressão ou cópia. 🖨️");
        addBotMessage("Por favor, me informe: É preto e branco ou colorido? Precisa encadernar? E qual a quantidade de páginas/cópias aproximadamente?");
    } 
    else if (keywords.orcamento.test(text)) {
        currentState = 'COLLECTING_ORCAMENTO';
        addBotMessage("Certo, você quer um orçamento! 📝");
        addBotMessage("Pode me enviar os itens da sua lista ou o que você precisa cotar?");
    }
    else if (keywords.pesquisa.test(text)) {
        currentState = 'COLLECTING_PESQUISA';
        addBotMessage("Você está procurando algum produto específico. 🔍");
        addBotMessage("Me diga exatamente qual produto, marca ou tipo você está buscando.");
    }
    else {
        // Assunto Geral - Repassar Direto
        currentCategory = 'Assunto geral';
        collectedData = text;
        addBotMessage("Entendi. Vou transferir você para um de nossos atendentes para tratar desse assunto.");
        finishFlow();
    }
}

function finishFlow() {
    currentState = 'END';
    addBotMessage("Tudo anotado! ✅");
    
    // Generate WhatsApp Link
    const phone = "5595999053019"; // User provided number: (95) 99905-3019
    let encodedMessage = `*Novo Atendimento - A4 Papelaria*%0A%0A`;
    encodedMessage += `*Categoria:* ${currentCategory}%0A`;
    if (collectedData) {
        encodedMessage += `*Detalhes/Solicitação:* ${collectedData}%0A`;
    }
    
    const waLink = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    const uiText = `Estou enviando seus dados para nossa equipe no WhatsApp. Clique no botão abaixo para concluir:
    <a href="${waLink}" target="_blank" class="btn-whatsapp">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        Enviar para o WhatsApp
    </a>`;
    
    addBotMessage(uiText, true);
    
    // Disable input
    userInput.disabled = true;
    userInput.placeholder = "Atendimento finalizado";
}
