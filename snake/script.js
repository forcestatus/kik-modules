const playBoard = document.querySelector(".play-board");

let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
// Initialize snakeBody with starting head position
let snakeBody = [[snakeX, snakeY]];


// Generate random food position
function changeFoodPosition() {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

// Handle arrow key presses
function changeDirection(e) {
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}



// Main game loop
function initGame() {
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    
    // Move snake head
    snakeX += velocityX;
    snakeY += velocityY;

    // Wrap snake around board edges
    if (snakeX < 1) snakeX = 30;
    if (snakeX > 30) snakeX = 1;
    if (snakeY < 1) snakeY = 30;
    if (snakeY > 30) snakeY = 1;

    // Add new head
    snakeBody.unshift([snakeX, snakeY]);

    // Check for food collision
    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition(); // New food
    } else {
        snakeBody.pop(); // Remove tail if no food eaten
    }

    // Draw snake
    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="${i === 0 ? 'head' : 'body'}" 
                        style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    }

    playBoard.innerHTML = htmlMarkup;
}

//call  game loop
changeFoodPosition();
initGame();
document.addEventListener("keydown", changeDirection);
setInterval(initGame, 125);
