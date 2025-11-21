// ==========================
//  TRIVIA MILLIONAIRE GAME
// ==========================

const API_BASE = 'https://opentdb.com/api.php';

const CATEGORIES = {
    any: 'Mixtas',
    9: 'General Knowledge',
    11: 'Film',
    15: 'Video Games',
    19: 'Mathematics',
    21: 'Sports'
};

// Helpers
function qs(sel, ctx=document){ return ctx.querySelector(sel); }
function qsa(sel, ctx=document){ return [...ctx.querySelectorAll(sel)]; }
function decodeHtml(html){
    const t = document.createElement('textarea');
    t.innerHTML = html;
    return t.value;
}

// ==========================
//       VISTAS
// ==========================

function InitialView(){
return `
<section class="initialView card">
  <div class="header"><h2 class="title">TRIVIA MILLIONAIRE</h2></div>

  <!-- Audio añadido en la vista inicial -->
  <audio id="initial-audio" src="./resources/36. Lost Woods.mp3" autoplay loop hidden></audio>

  <form id="initial-form" class="form-container">

    <div class="form-group">
      <label>Nombre (2-20 caracteres)</label>
      <input type="text" id="playerName" minlength="2" maxlength="20" required />
    </div>

    <div class="form-group">
      <label>Cantidad de preguntas</label>
      <input type="number" id="amount" min="5" max="20" required />
    </div>

    <div class="form-group">
      <label>Dificultad</label>
      <select id="difficulty">
        <option value="easy">Fácil</option>
        <option value="medium">Media</option>
        <option value="hard">Difícil</option>
      </select>
    </div>

    <div class="form-group">
      <label>Categoría</label>
      <select id="category">
        ${Object.entries(CATEGORIES)
            .map(([k,v])=>`<option value="${k}">${v}</option>`)
            .join('')}
      </select>
    </div>

    <button class="btn-start">Comenzar</button>

  </form>
</section>
`;
}

function LoadingView(){
return `
<section class="loading card">
  <div class="loader"></div>
  <p>Cargando preguntas...</p>
</section>
`;
}

function QuestionView({index,total,text,choices,sec,percent}){
return `
<section class="card">
  <div class="progress small">Pregunta ${index} de ${total}</div>

  <div class="question-text">${text}</div>

  <div class="answers">
    ${choices.map((c,i)=>`<button class="answer-btn" data-i="${i}">${c}</button>`).join('')}
  </div>

  <div class="timer"><div class="timer-bar" style="width:${percent}%"></div></div>
  <div class="timer-text">Tiempo restante: ${sec}s</div>
</section>
`;
}

function ResultView({player,total,correct,score,avg}){
const pct = Math.round((correct/total)*100);

return `
<section class="card">
  <h2>Resultados de ${player}</h2>

  <div class="results-grid">

    <div class="result-card">
      <div class="small">Puntuación total</div>
      <div style="font-size:32px;font-weight:bold">${score}</div>
    </div>

    <div class="result-card">
      <div class="small">Aciertos</div>
      <div style="font-size:28px">${correct} / ${total}</div>
      <div>${pct}%</div>
    </div>

    <div class="result-card">
      <div class="small">Tiempo promedio</div>
      <div style="font-size:24px">${avg.toFixed(1)}s</div>
    </div>

    <div class="result-card">
      <div class="controls">
        <button id="retry" class="btn">Reintentar</button>
        <button id="change" class="btn secondary">Cambiar configuración</button>
      </div>
    </div>

  </div>
</section>
`;
}

// ==========================
//        STATE
// ==========================

const app = document.getElementById('app');

let state = {
    config:null,
    questions:[],
    index:0,
    sec:20,
    timer:null,
    score:0,
    correct:0,
    times:[],
    lastClicked:null
};

function render(html){
    app.innerHTML = html;
}

// ==========================
//    FETCH PREGUNTAS API
// ==========================

async function getQuestions({amount,difficulty,category}){
    const p = new URLSearchParams({
        amount,
        difficulty,
        type:'multiple'
    });

    if(category !== 'any') p.set('category', category);

    const res = await fetch(`${API_BASE}?${p}`);
    const data = await res.json();

    if(data.response_code !== 0){
        throw new Error("No hay suficientes preguntas para esa configuración");
    }

    return data.results.map(q=>({
        question: decodeHtml(q.question),
        correct: decodeHtml(q.correct_answer),
        incorrect: q.incorrect_answers.map(a=>decodeHtml(a))
    }));
}

// ==========================
//      GAME FLOW
// ==========================

function startGameFromConfig(cfg){
    state.config = cfg;
    state.index = 0;
    state.sec = 20;
    state.score = 0;
    state.correct = 0;
    state.times = [];
    state.lastClicked = null;

    render(LoadingView());

    getQuestions(cfg).then(q=>{
        state.questions = q.map(q => ({
            ...q,
            choices: [...q.incorrect, q.correct].sort(()=>Math.random()-0.5)
        }));

        startQuestion(0);
        
    }).catch(err=>{
        render(`
        <div class='card'>
           <h3>Error</h3>
           <p>${err.message}</p>
           <button id='back' class='btn'>Volver</button>
        </div>
        `);

        qs('#back').onclick = ()=> bootstrap();
    });
}

function startQuestion(i){
    state.index = i;
    state.sec = 20;
    state.lastClicked = null;

    const q = state.questions[i];

    render(QuestionView({
        index: i+1,
        total: state.config.amount,
        text: q.question,
        choices: q.choices,
        sec: state.sec,
        percent: 100
    }));

    qsa('.answer-btn').forEach(b => b.onclick = onAnswer);

    startTimer();
}

function startTimer(){
    clearInterval(state.timer);

    state.timer = setInterval(()=>{
        state.sec--;

        const pct = (state.sec/20)*100;

        qs('.timer-bar').style.width = pct + '%';
        qs('.timer-text').textContent = `Tiempo restante: ${state.sec}s`;

        if(state.sec <= 5){
            qs('.timer').classList.add('timer-warning');
        }

        if(state.sec <= 0){
            clearInterval(state.timer);
            state.times.push(20);
            state.lastClicked = null;
            showFeedback(false);
        }

    },1000);
}

function onAnswer(e){
    clearInterval(state.timer);

    const btn = e.target;
    state.lastClicked = btn;

    const i = parseInt(btn.dataset.i);
    const q = state.questions[state.index];
    const choice = q.choices[i];

    const used = 20 - state.sec;
    state.times.push(used);

    if(choice === q.correct){
        state.score += 10;
        state.correct++;
        showFeedback(true);
    } else {
        showFeedback(false);
    }
}

function showFeedback(isCorrect){
    const q = state.questions[state.index];

    qsa('.answer-btn').forEach(btn=>{
        btn.disabled = true;

        const val = q.choices[parseInt(btn.dataset.i)];

        if(val === q.correct){
            btn.classList.add('correct');
        } 
        else if(btn === state.lastClicked){
            btn.classList.add('wrong');
        }
    });

    setTimeout(()=>{
        const next = state.index + 1;

        if(next < state.config.amount){
            startQuestion(next);
        } else {
            endGame();
        }
    }, 1000);
}

// ==========================
//     END GAME
// ==========================

function endGame(){
    clearInterval(state.timer);

    while(state.times.length < state.config.amount){
        state.times.push(20);
    }

    const avg = state.times.reduce((a,b)=>a+b,0) / state.times.length;

    render(ResultView({
        player: state.config.playerName,
        total: state.config.amount,
        correct: state.correct,
        score: state.score,
        avg
    }));

    qs('#retry').onclick = ()=> startGameFromConfig(state.config);
    qs('#change').onclick = ()=> bootstrap();
}

// ==========================
//     INITIALIZATION
// ==========================

function bootstrap(){
    render(InitialView());

    qs('#initial-form').onsubmit = (e)=>{
        e.preventDefault();
        
        const cfg = {
            playerName: qs('#playerName').value.trim(),
            amount: parseInt(qs('#amount').value),
            difficulty: qs('#difficulty').value,
            category: qs('#category').value
        };

        startGameFromConfig(cfg);
    };
}

bootstrap();
