// app.js
let entries = []
const moodOptions = ['😢','🙁','😐','🙂','🥰']
let currentMood = ''

const prompts = [
    "What made you smile today?",
    "What are you grateful for right now?",
    "What’s one thing you learned today?",
    "How did you take care of yourself today?",
    "What would you tell your future self?",
    "Describe your perfect day in detail.",
    "What’s weighing on your heart?",
    "What are you proud of this week?",
    "If today was a song, what would it be?",
    "What do you want more of in life?"
]

function loadData() {
    const saved = localStorage.getItem('echo_entries')
    if (saved) entries = JSON.parse(saved)
}

function saveData() {
    localStorage.setItem('echo_entries', JSON.stringify(entries))
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function renderMoodPicker() {
    const container = document.getElementById('mood-picker')
    container.innerHTML = ''
    moodOptions.forEach((mood, i) => {
        const btn = document.createElement('button')
        btn.textContent = mood
        btn.className = `mood-btn text-5xl transition-all`
        btn.onclick = () => {
            currentMood = mood
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
        }
        container.appendChild(btn)
    })
}

function getRandomPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)]
}

function renderToday() {
    document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
    document.getElementById('daily-prompt').textContent = getRandomPrompt()
    document.getElementById('entry-text').value = ''
    currentMood = ''
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'))
}

function saveEntry() {
    const text = document.getElementById('entry-text').value.trim()
    if (!text && !currentMood) {
        showToast("Write something or pick a mood 💭")
        return
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Update if already exists today
    const existingIndex = entries.findIndex(e => e.date === today)
    if (existingIndex !== -1) {
        entries[existingIndex].text = text || entries[existingIndex].text
        entries[existingIndex].mood = currentMood || entries[existingIndex].mood
    } else {
        entries.unshift({
            date: today,
            mood: currentMood || '😐',
            text: text || "No text written"
        })
    }

    saveData()
    showToast("Entry saved in your echo ✨")
    renderToday()
    renderEntriesList()
    renderInsights()
}

function renderEntriesList(filtered = null) {
    const container = document.getElementById('entries-list')
    container.innerHTML = ''
    
    const list = filtered || entries
    
    if (list.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-neutral-400">No entries yet.<br>Start writing today.</div>`
        return
    }
    
    list.forEach((entry, index) => {
        const div = document.createElement('div')
        div.className = `entry-card bg-neutral-900 rounded-3xl p-6 cursor-pointer`
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium">${formatDate(entry.date)}</p>
                    <p class="text-xs text-neutral-500 mt-0.5">${entry.text.substring(0, 65)}${entry.text.length > 65 ? '...' : ''}</p>
                </div>
                <div class="text-4xl">${entry.mood}</div>
            </div>
        `
        div.onclick = () => showEntryDetail(index)
        container.appendChild(div)
    })
}

function filterEntries() {
    const term = document.getElementById('search-input').value.toLowerCase().trim()
    if (!term) {
        renderEntriesList()
        return
    }
    const filtered = entries.filter(e => 
        e.text.toLowerCase().includes(term)
    )
    renderEntriesList(filtered)
}

function showEntryDetail(index) {
    const entry = entries[index]
    const text = prompt(`📝 ${formatDate(entry.date)}\n\n${entry.text}\n\nMood: ${entry.mood}\n\nEdit text below:`, entry.text)
    if (text !== null && text !== entry.text) {
        entry.text = text
        saveData()
        renderEntriesList()
    }
}

function renderPrompts() {
    const container = document.getElementById('prompts-grid')
    container.innerHTML = ''
    prompts.forEach(prompt => {
        const div = document.createElement('div')
        div.className = `bg-neutral-900 rounded-3xl p-6 cursor-pointer hover:border-violet-500/30 border border-transparent`
        div.innerHTML = `
            <p class="italic text-neutral-300">"${prompt}"</p>
        `
        div.onclick = () => {
            switchTab(0)
            document.getElementById('daily-prompt').textContent = prompt
        }
        container.appendChild(div)
    })
}

function renderInsights() {
    // Total entries
    document.getElementById('total-entries').textContent = entries.length
    
    // Streak calculation
    let streak = 0
    const sortedDates = entries.map(e => e.date).sort().reverse()
    let current = new Date()
    
    for (let i = 0; i < 30; i++) {
        const checkDate = current.toISOString().split('T')[0]
        if (sortedDates.includes(checkDate)) {
            streak++
            current.setDate(current.getDate() - 1)
        } else {
            break
        }
    }
    document.getElementById('streak-count').textContent = streak
    
    // Recent moods
    const moodDiv = document.getElementById('mood-history')
    moodDiv.innerHTML = ''
    const recent = entries.slice(0, 5)
    recent.forEach(e => {
        const span = document.createElement('span')
        span.textContent = e.mood
        moodDiv.appendChild(span)
    })
}

function showToast(msg) {
    const toast = document.getElementById('toast')
    document.getElementById('toast-text').innerHTML = msg
    toast.classList.remove('hidden')
    setTimeout(() => toast.classList.add('hidden'), 2400)
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'))
    document.getElementById(`tab-${['today','history','prompts','insights'][tab]}`).classList.remove('hidden')
    
    document.querySelectorAll('.nav-item').forEach((el, i) => {
        el.classList.toggle('text-violet-400', i === tab)
    })
    
    if (tab === 1) renderEntriesList()
    if (tab === 3) renderInsights()
}

function newEntry() {
    switchTab(0)
}

function clearAllData() {
    if (confirm('Delete ALL journal entries forever?')) {
        entries = []
        saveData()
        renderEntriesList()
        renderInsights()
        showToast('Everything cleared 🕊️')
    }
}

function initializeEcho() {
    loadData()
    renderMoodPicker()
    renderToday()
    renderPrompts()
    renderEntriesList()
    renderInsights()
    switchTab(0)
    
    showToast('Welcome back to Echo 💭')
    
    console.log('%c✨ Echo ready – your private thoughts are safe', 'color:#a78bfa; font-family:monospace')
}

window.onload = initializeEcho
