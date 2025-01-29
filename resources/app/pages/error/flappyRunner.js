console.log("flappyRunner.js loaded");

function initGame() {
    console.log("initGame function called");
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Set canvas size to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game variables
    let bird = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        velocity: 0,
        gravity: 0.5,
        jump: -10,
        radius: 20
    };
    let pipes = [];
    let score = 0;
    let gameOver = false;
    let gameStarted = false;

    function createPipe() {
        let gap = 200;
        let minHeight = 50;
        let maxHeight = canvas.height - gap - minHeight;
        let height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        pipes.push({
            x: canvas.width,
            y: 0,
            width: 50,
            topHeight: height,
            bottomY: height + gap
        });
    }

    function update() {
        if (!gameStarted) return;
        if (gameOver) return;

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y + bird.radius > canvas.height) {
            endGame();
        }

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
            createPipe();
        }

        pipes.forEach((pipe, index) => {
            pipe.x -= 2;

            if (pipe.x + pipe.width < 0) {
                pipes.splice(index, 1);
                score++;
            }

            if (
                bird.x + bird.radius > pipe.x &&
                bird.x - bird.radius < pipe.x + pipe.width &&
                (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.bottomY)
            ) {
                endGame();
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw bird
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw pipes
        ctx.fillStyle = 'green';
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.topHeight);
            ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        });

        // Draw score
        ctx.fillStyle = 'black';
        ctx.font = `${Math.floor(canvas.height / 20)}px Arial`;
        ctx.fillText(`Score: ${score}`, 10, 30);

        if (gameOver) {
            ctx.fillStyle = 'black';
            ctx.font = `${Math.floor(canvas.height / 12)}px Arial`;
            ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        }
    }

    function gameLoop() {
        update();
        draw();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        gameOver = true;
        cancelAnimationFrame(gameLoopId);
    }

    function restartGame() {
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        gameOver = false;
        gameStarted = false;
        draw(); // Draw the initial state
    }

    // Event listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' && !gameStarted && !gameOver) {
            gameStarted = true;
            gameLoop();
        } else if (e.code === 'Space') {
            if (gameOver) {
                restartGame();
            } else if (gameStarted) {
                bird.velocity = bird.jump;
            }
            e.preventDefault();
        }
    });

    canvas.addEventListener('click', () => {
        if (gameOver) {
            restartGame();
        } else if (gameStarted) {
            bird.velocity = bird.jump;
        } else {
            gameStarted = true;
            gameLoop();
        }
    });

    // Start the game
    draw();
}

// Don't call initGame here, it will be called from game.html
