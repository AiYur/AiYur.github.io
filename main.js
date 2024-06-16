const jumpScareImages = ["img/scary1.jpg", "img/scary2.jpg", "img/scary3.jpg", "img/scary4.jpeg", "img/scary5.jpeg"];
const jumpScareSounds = ["sound/sound1.wav", "sound/sound2.mp3", "sound/sound3.mp3", "sound/sound4.mp3", "sound/sound5.mp3"];

function getUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const numPlayers = parseInt(params.get('numPlayers')) || 1;
  const numBots = parseInt(params.get('numBots')) || 0;
  return { numPlayers, numBots };
}

const { numPlayers, numBots } = getUrlParameters();
const players = Array.from({ length: numPlayers }, (_, i) => ['red', 'blue', 'green', 'yellow'][i]);
const aiPlayers = Array.from({ length: numBots }, (_, i) => `ai${i + 1}`);

let turn = players[0];
let stopEvent = false;
let moveCount = 0;

const snakeHeadsAndLadderBottoms = [
  // ... (same as before)
];
const snakeTailsAndLadderTops = [
  // ... (same as before)
];

resetPlayerPositions();
boxNumbers();

document.addEventListener("keydown", async (e) => {
  if (e.keyCode === 83 && !stopEvent && !aiPlayers.includes(turn)) {
    stopEvent = true;
    const diceNum = await rollDice();
    await new Promise((resolve) => setTimeout(resolve, 400));
    await movePlayer(diceNum);
    await new Promise((resolve) => setTimeout(resolve, 400));
    changeTurn();
    stopEvent = false;
  }
});

function changeTurn() {
  const currentIndex = players.indexOf(turn);
  let nextIndex;

  // If there's only one player, don't change the turn
  if (players.length === 1) {
    return;
  }

  // Check if there's only one player left
  if (players.length === 1) {
    // Switch the turn to the AI
    if (turn === players[0]) {
      turn = aiPlayers[0];
      document.querySelector("#p_turn").innerHTML = `${turn.toUpperCase()} 's turn`;
      handleAIPlayerTurn();
    } else {
      // Switch the turn back to the player
      turn = players[0];
      document.querySelector("#p_turn").innerHTML = `${turn.toUpperCase()} player's turn`;
    }
  } else {
    nextIndex = (currentIndex + 1) % players.length;
    turn = players[nextIndex];
    document.querySelector("#p_turn").innerHTML = `${turn.toUpperCase()} player's turn`;

    if (aiPlayers.includes(turn)) {
      handleAIPlayerTurn();
    }
  }
}

async function handleAIPlayerTurn() {
  const diceNum = await rollDice();
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Check if moving the full dice roll will cause the AI player to land on a snake head
  const currentPosition = getPlayerPosition();
  const [nextLeft, nextTop] = getNextPosition(diceNum);
  const landingOnSnakeHead = snakeHeadsAndLadderBottoms.some(([x, y]) => x === nextLeft && y === nextTop);

  if (landingOnSnakeHead) {
    // If moving the full dice roll will land on a snake head, move one step less
    await movePlayer(diceNum - 1);
  } else {
    // Otherwise, move the full dice roll
    await movePlayer(diceNum);
  }

  await new Promise((resolve) => setTimeout(resolve, 400));
  await handleLaddersAndSnakes();
  changeTurn();
}

function getNextPosition(steps) {
  let [left, top] = getPlayerPosition();
  for (let i = 0; i < steps; i++) {
    const direction = getDirection(left, top);
    switch (direction) {
      case "up":
        top -= 9.8;
        break;
      case "right":
        left += 9.8;
        break;
      case "left":
        left -= 9.8;
        break;
    }
  }
  return [left, top];
}

async function movePlayer(diceNum) {
  for (let i = 1; i <= diceNum; i++) {
    const direction = getDirection();
    await moveInDirection(direction);
    moveCount++;
    handleRandomJumpScare();
    checkWinCondition(); // Check if the player has won
  }
  await handleLaddersAndSnakes();
}

async function handleLaddersAndSnakes() {
  const currentPosition = getPlayerPosition();
  const snakeHeadOrLadderBottom = snakeHeadsAndLadderBottoms.find(
    ([x, y]) => x === currentPosition[0] && y === currentPosition[1]
  );
  if (snakeHeadOrLadderBottom) {
    const snakeTailOrLadderTop = snakeTailsAndLadderTops[
      snakeHeadsAndLadderBottoms.indexOf(snakeHeadOrLadderBottom)
    ];
    playSound("sound/move.mp3");
    setPlayerPosition(snakeTailOrLadderTop[0], snakeTailOrLadderTop[1]);
    await new Promise((resolve) => setTimeout(resolve, 400));
    checkWinCondition(); // Check if the player has won
  }
}

async function moveInDirection(direction) {
  playSound("sound/move.mp3");
  const [left, top] = getPlayerPosition();
  switch (direction) {
    case "up":
      setPlayerPosition(left, top - 9.8);
      break;
    case "right":
      setPlayerPosition(left + 9.8, top);
      break;
    case "left":
      setPlayerPosition(left - 9.8, top);
      break;
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
}

function getDirection() {
  const [left, top] = getPlayerPosition();
  if ((left === 88.2 && top % -19.6 === 0) || (left === 0 && top % -19.6 !== 0)) {
    return "up";
  } else if (top % -19.6 === 0) {
    return "right";
  } else {
    return "left";
  }
}

function getPlayerPosition() {
  const leftStr = document.querySelector(`#${turn}`).style.marginLeft;
  const topStr = document.querySelector(`#${turn}`).style.marginTop;
  const left = leftStr ? parseFloat(leftStr.split("v")[0]) : 0;
  const top = topStr ? parseFloat(topStr.split("v")[0]) : 0;
  return [left, top];
}

function setPlayerPosition(left, top) {
  document.querySelector(`#${turn}`).style.marginLeft = `${left}vmin`;
  document.querySelector(`#${turn}`).style.marginTop = `${top}vmin`;
}

function resetPlayerPositions() {
  const mainContainer = document.getElementById('main');

  // Remove existing player tokens
  const existingPlayers = document.querySelectorAll('.players');
  existingPlayers.forEach(player => player.remove());

  // Create new player tokens
  players.forEach((player, index) => {
    const playerToken = document.createElement('div');
    playerToken.className = 'players';
    playerToken.id = player;
    playerToken.style.backgroundColor = ['red', 'blue', 'green', 'yellow'][index];
    mainContainer.appendChild(playerToken);
  });

  aiPlayers.forEach((player, index) => {
    const aiToken = document.createElement('div');
    aiToken.className = 'players';
    aiToken.id = player;
    aiToken.style.backgroundColor = 'black';
    mainContainer.appendChild(aiToken);
  });
}

async function rollDice() {
  const diceNum = Math.floor(Math.random() * 6) + 1;
  const values = [
    [0, -360],
    [-180, 360],
    [-180, 270],
    [0, -90],
    [270, 180],
    [90, 90],
  ];
  playSound("sound/diceRoll.mp3");
  document.querySelector("#cube_inner").style.transform = `rotateX(360deg) rotateY(360deg)`;
  await new Promise((resolve) => setTimeout(resolve, 750));
  document.querySelector("#cube_inner").style.transform = `rotateX(${values[diceNum - 1][0]}deg) rotateY(${values[diceNum - 1][1]}deg)`;
  await new Promise((resolve) => setTimeout(resolve, 750));
  return diceNum;
}

function boxNumbers() {
  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box, i) => {
    if (String(i).length === 1 || (String(i).length === 2 && Number(String(i)[0]) % 2 === 0)) {
      box.innerHTML = 100 - i;
    } else {
      box.innerHTML = String(Number(`${9 - Number(String(i)[0])}${String(i)[1]}`) + 1);
    }
  });
}

function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play();
}

function handleRandomJumpScare() {
  if (moveCount % 7 === 0) {
    const randomIndex = Math.floor(Math.random() * jumpScareImages.length);
    const image = new Image();
    image.src = jumpScareImages[randomIndex];
    image.style.position = 'fixed';
    image.style.top = '50%';
    image.style.left = '50%';
    image.style.transform = 'translate(-50%, -50%)';
    image.style.zIndex = '9999';
    document.body.appendChild(image);

    const audio = new Audio(jumpScareSounds[randomIndex]);
    audio.play();

    setTimeout(() => {
      document.body.removeChild(image);
    }, 3000); // Remove the image after 3 seconds
  }
}

function getBlockNumber(left, top) {
  const row = Math.floor((-top) / 9.8);
  const col = Math.floor(left / 9.8);
  return row * 10 + col + 1;
}

function checkWinCondition() {
  const [left, top] = getPlayerPosition();
  const blockNumber = getBlockNumber(left, top);

  if (blockNumber === 100) {
    // Display "You Win" message
    const winMessage = document.createElement('div');
    winMessage.textContent = 'You Win!';
    winMessage.style.position = 'fixed';
    winMessage.style.top = '50%';
    winMessage.style.left = '50%';
    winMessage.style.transform = 'translate(-50%, -50%)';
    winMessage.style.zIndex = '9999';
    winMessage.style.fontSize = '48px';
    winMessage.style.fontWeight = 'bold';
    winMessage.style.color = 'green';
    document.body.appendChild(winMessage);

    // Stop the game
    stopEvent = true;
  }
}