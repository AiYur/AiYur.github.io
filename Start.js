document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-button');
    const numPlayersInput = document.getElementById('num-players');
    const numBotsInput = document.getElementById('num-bots');

    startButton.addEventListener('click', function() {
        const numPlayers = parseInt(numPlayersInput.value);
        const numBots = parseInt(numBotsInput.value);

        if (numPlayers + numBots > 4) {
            alert('The total number of players and bots cannot exceed 4.');
            return;
        }

        if (numPlayers < 1) {
            alert('There must be at least 1 human player.');
            return;
        }

        if (numBots > 3) {
            alert('The maximum number of bots allowed is 3.');
            return;
        }

        // Store the number of players and bots in session storage
        sessionStorage.setItem('numPlayers', numPlayers);
        sessionStorage.setItem('numBots', numBots);

        // Redirect to the game page
        window.location.href = 'main.html?numPlayers=' + numPlayers + '&numBots=' + numBots;
    });
});