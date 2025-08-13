const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i ");

let foodX, foodY;
let snakeX, snakeY, velocityX, velocityY, snakeBody, gameLoop;
let testMode = false; // Toggle for long snake at start
let score = 0;

// Get high score from locaal storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

function resetGame() {
    snakeX = 5;
    snakeY = 10;
    snakeBody = [[snakeX, snakeY]];
    if (testMode) {
        for (let i = 1; i < 10; i++) {
            snakeBody.push([snakeX - i, snakeY]);
        }
        velocityX = 1;  // start moving right immediately in test mode
        velocityY = 0;
    } else {
        velocityX = 0;
        velocityY = 0;
    }
    clearInterval(gameLoop);
    gameLoop = null;
    changeFoodPosition();
    initGame();
}

function changeFoodPosition() {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

function changeDirection(e) {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0; velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0; velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1; velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1; velocityY = 0;
    }

    // Start the game loop if not running
    if (!gameLoop) {
        gameLoop = setInterval(initGame, 125);
    }
}

controls.forEach(key => {
//remove to log key    key.addEventListener("click", () => console.log(key));
    // call changeDriection on each key click and passing key dataset value as object
    key.addEventListener("click", () => changeDirection({ key: key.dataset.key}));
})

function initGame() {
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    snakeX += velocityX;
    snakeY += velocityY;

    // Wrap around edges
    if (snakeX < 1) snakeX = 30;
    if (snakeX > 30) snakeX = 1;
    if (snakeY < 1) snakeY = 30;
    if (snakeY > 30) snakeY = 1;

    // Add head to body
    snakeBody.unshift([snakeX, snakeY]);

    // Check if snake hits food
    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        score++; //increment score by 1
        
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);

        scoreElement.innerText = `Score: ${score}`;  // use backticks for template literal

        highScoreElement.innerText = `High Score: ${highScore}`; // store high score


    } else {
        snakeBody.pop();
        

    }

    // Draw snake & detect self-collision
    for (let i = 0; i < snakeBody.length; i++) {
        if (i !== 0 && snakeBody[0][0] === snakeBody[i][0] &&
            snakeBody[0][1] === snakeBody[i][1]) {
            alert("Game Over!");
            resetGame();
            return;
        }
        htmlMarkup += `<div class="${i === 0 ? 'head' : 'body'}" 
                        style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    }

    playBoard.innerHTML = htmlMarkup;
}

// Start fresh
resetGame();
document.addEventListener("keydown", changeDirection);
