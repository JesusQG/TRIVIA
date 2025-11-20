export function InitialView() {
    return `
        <section class="initialView">

            <h1 class="title">BIENVENIDO A TRIVIA MILLIONARE GAME</h1>

            <form id="initial-form" class="form-container">

                <div class="form-group">
                    <label for="playerName"> Nombre del participante: </label>
                    <input
                        type="text"
                        id="playerName"
                        name="playerName"
                        minlength="2"
                        maxlength="20"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="amount"> Cuantas Preguntas quieres responder?</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        min="5"
                        max="20"
                        required
                        placeholder = " 5 - 20"

                    >
                </div>

                <!-- Dificultad -->
                <div class="form-group">
                    <label for="difficulty">Dificultad:</label>
                    <select id="difficulty" name="difficulty" required>
                        <option value="easy">Fácil</option>
                        <option value="medium">Media</option>
                        <option value="hard">Difícil</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="category">Categoría:</label>
                    <select id="category" name="category" required>
                    <option value="any">Mixtas</option>
                    <option value="11">Film</option>
                    <option value="15">Video Games</option>
                    <option value="19">Mathematics</option>
                    <option value="9">General Knowledge</option>
                    <option value="21">Sports</option>
                    </select>
                </div>

                <!-- Botón -->
                <button type="submit" class="btn-start">
                    VAMOS ALLA!!
                </button>

            </form>

        </section>
    `;
}

export function playAudio() {
    const audio = new Audio(new URL('../resources/36. Lost Woods.mp3', import.meta.url));
    audio.loop = true; 
    audio.play().catch(err => console.warn('Reproducción de audio falló:', err));
    return audio;
}