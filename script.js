const game = {
    board: null,
    context: null,
    rowCount: 21,
    columnCount: 19,
    tileSize: 32,
    score: 0,
    lives: 3,
    gameOver: false,
    powerMode: false,
    powerEndTime: 0
};

const elements = {
    pacman: null,
    ghosts: [],
    walls: [],
    foods: [],
    powerPellets: []
};

const images = {
    wall: new Image(),
    blueGhost: new Image(),
    orangeGhost: new Image(),
    pinkGhost: new Image(),
    redGhost: new Image(),
    scaredGhost: new Image(),
    pacmanUp: new Image(),
    pacmanDown: new Image(),
    pacmanLeft: new Image(),
    pacmanRight: new Image(),
    cherry1: new Image(),
    cherry2: new Image()
};

const gameMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "X O  X       X  O X",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "X O          X  O X",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

window.onload = function () {
    game.board = document.getElementById("board");
    game.board.height = game.rowCount * game.tileSize;
    game.board.width = game.columnCount * game.tileSize;
    game.context = game.board.getContext("2d");

    loadImages();
    loadGameMap();
    setupEventListeners();
    gameLoop();
};

function loadImages() {
    images.wall.src = "./images/wall.png";
    images.blueGhost.src = "./images/blueGhost.png";
    images.orangeGhost.src = "./images/orangeGhost.png";
    images.pinkGhost.src = "./images/pinkGhost.png";
    images.redGhost.src = "./images/redGhost.png";
    images.scaredGhost.src = "./images/scaredGhost.png";
    images.pacmanUp.src = "./images/pacmanUp.png";
    images.pacmanDown.src = "./images/pacmanDown.png";
    images.pacmanLeft.src = "./images/pacmanLeft.png";
    images.pacmanRight.src = "./images/pacmanRight.png";
    images.cherry1.src = "./images/cherry.png";
    images.cherry2.src = "./images/cherry2.png";
}

function loadGameMap() {
    elements.walls = [];
    elements.foods = [];
    elements.powerPellets = [];
    elements.ghosts = [];

    for (let r = 0; r < game.rowCount; r++) {
        for (let c = 0; c < game.columnCount; c++) {
            const tile = gameMap[r][c];
            const x = c * game.tileSize;
            const y = r * game.tileSize;

            if (tile === 'X') {
                elements.walls.push(new GameObject(images.wall, x, y));
            } else if (tile === ' ') {
                elements.foods.push(new GameObject(null, x + 14, y + 14, 4, 4));
            } else if (tile === 'p') {
                elements.ghosts.push(new Ghost(images.pinkGhost, x, y, 'pink'));
            } else if (tile === 'r') {
                elements.ghosts.push(new Ghost(images.redGhost, x, y, 'red'));
            } else if (tile === 'b') {
                elements.ghosts.push(new Ghost(images.blueGhost, x, y, 'blue'));
            } else if (tile === 'o') {
                elements.ghosts.push(new Ghost(images.orangeGhost, x, y, 'orange'));
            } else if (tile === 'P') {
                elements.pacman = new Pacman(images.pacmanRight, x, y);
            } else if (tile === 'O') {
                const cherryImage = (r + c) % 2 === 0 ? images.cherry1 : images.cherry2;
                elements.powerPellets.push(new GameObject(cherryImage, x + 8, y + 8, 16, 16));
            }
        }
    }
}

class GameObject {
    constructor(image, x, y, width = game.tileSize, height = game.tileSize) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.startX = x;
        this.startY = y;
    }

    draw() {
        if (this.image) {
            game.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}

class Pacman extends GameObject {
    constructor(image, x, y) {
        super(image, x, y);
        this.speed = game.tileSize / 4;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.velocityX = this.speed;
        this.velocityY = 0;
    }

    update() {
        this.handleTunnel();
        const oldX = this.x;
        const oldY = this.y;
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.checkWallCollision()) {
            this.x = oldX;
            this.y = oldY;
        }

        this.updateDirection();
    }

    handleTunnel() {
        if (this.x < -this.width) this.x = game.board.width;
        else if (this.x > game.board.width) this.x = -this.width;
    }

    checkWallCollision() {
        return elements.walls.some(wall => checkCollision(this, wall));
    }

    updateDirection() {
        const directions = {
            'up': { vx: 0, vy: -this.speed, image: images.pacmanUp },
            'down': { vx: 0, vy: this.speed, image: images.pacmanDown },
            'left': { vx: -this.speed, vy: 0, image: images.pacmanLeft },
            'right': { vx: this.speed, vy: 0, image: images.pacmanRight },
        };
        if (this.nextDirection !== this.direction) {
            const d = directions[this.nextDirection];
            const testX = this.x + d.vx;
            const testY = this.y + d.vy;
            const testPacman = new GameObject(null, testX, testY, this.width, this.height);

            if (!elements.walls.some(wall => checkCollision(testPacman, wall))) {
                this.velocityX = d.vx;
                this.velocityY = d.vy;
                this.image = d.image;
                this.direction = this.nextDirection;
            }
        }
    }
}

class Ghost extends GameObject {
    constructor(image, x, y, color) {
        super(image, x, y);
        this.color = color;
        this.speed = game.tileSize / 6;
        this.direction = this.getRandomDirection();
        this.updateVelocity();
        this.scared = false;
        this.isRespawning = false;
        this.respawnTime = 0;
    }

    update() {
        if (this.isRespawning) {
            if (Date.now() > this.respawnTime){
                this.isRespawning = false;
                this.reset();
                this.direction = this.getRandomDirection();
                this.updateVelocity();
            }
            return;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;
        this.handleTunnel();

        if (this.checkWallCollision() || this.shouldChangeDirection()) {
            this.x -= this.velocityX;
            this.y -= this.velocityY;
            this.direction = this.getRandomDirection();
            this.updateVelocity();
        }
        this.updateImage();
    }

    draw() {
        if (!this.isRespawning) {
            super.draw();
        }
    }

    updateImage() {
        if (this.isRespawning) return;
        this.image = game.powerMode ? images.scaredGhost : images[this.color + 'Ghost'];
        this.scared = game.powerMode;
    }

    handleTunnel() {
        if (this.x < -this.width) this.x = game.board.width;
        else if (this.x > game.board.width) this.x = -this.width;
    }

    checkWallCollision() {
        return elements.walls.some(wall => checkCollision(this, wall));
    }

    shouldChangeDirection() {
        return Math.random() < 0.02;
    }

    getRandomDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    updateVelocity() {
        switch (this.direction) {
            case 'up': this.velocityX = 0; this.velocityY = -this.speed; break;
            case 'down': this.velocityX = 0; this.velocityY = this.speed; break;
            case 'left': this.velocityX = -this.speed; this.velocityY = 0; break;
            case 'right': this.velocityX = this.speed; this.velocityY = 0; break;
        }
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

function setupEventListeners() {
    document.addEventListener('keydown', function (e) {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW': elements.pacman.nextDirection = 'up'; break;
            case 'ArrowDown':
            case 'KeyS': elements.pacman.nextDirection = 'down'; break;
            case 'ArrowLeft':
            case 'KeyA': elements.pacman.nextDirection = 'left'; break;
            case 'ArrowRight':
            case 'KeyD': elements.pacman.nextDirection = 'right'; break;
        }
    });
}

function drawGame() {
    game.context.clearRect(0, 0, game.board.width, game.board.height);

    elements.walls.forEach(wall => wall.draw());

    elements.foods.forEach(food => {
        game.context.fillStyle = "white";
        game.context.fillRect(food.x, food.y, food.width, food.height);
    });

    elements.powerPellets.forEach(pellet => pellet.draw());

    elements.ghosts.forEach(ghost => {
        ghost.update();
        ghost.draw();
    });

    if (elements.pacman) {
        elements.pacman.update();
        elements.pacman.draw();
    }

    checkFoodCollision();
    checkPowerPelletCollision();
    checkGhostCollision();

    if (elements.foods.length === 0 && elements.powerPellets.length === 0) {
        game.gameOver = true;
        alert("You win!");
    }


    game.context.fillStyle = "white";
    game.context.font = "20px Arial";
    game.context.fillText(`Score: ${game.score}`, 20, 30);
    game.context.fillText(`Lives: ${game.lives}`, game.board.width - 100, 30);
}

function gameLoop() {
    if (!game.gameOver) {
        drawGame();
        if (game.powerMode && Date.now() > game.powerEndTime) {
            game.powerMode = false;
        }
    }
    setTimeout(gameLoop, 1000 / 20);
}

function checkFoodCollision() {
    for (let i = elements.foods.length - 1; i >= 0; i--) {
        if (checkCollision(elements.pacman, elements.foods[i])) {
            elements.foods.splice(i, 1);
            game.score += 10;
        }
    }
}

function checkPowerPelletCollision() {
    for (let i = elements.powerPellets.length - 1; i >= 0; i--) {
        if (checkCollision(elements.pacman, elements.powerPellets[i])) {
            elements.powerPellets.splice(i, 1);
            game.score += 50;
            game.powerMode = true;
            game.powerEndTime = Date.now() + 10000;
        }
    }
}

function checkGhostCollision() {
    elements.ghosts.forEach(ghost => {
        if (!ghost.isRespawning && checkCollision(elements.pacman, ghost)) {
            if (ghost.scared) {
                ghost.isRespawning = true;
                ghost.respawnTime = Date.now() + 4000;
                game.score += 200;
            } else {
                game.lives--;
                if (game.lives <= 0) {
                    game.gameOver = true;
                    alert("Game Over!");
                }
                else {
                    resetPositions();
                }
            }
        }
    });
}

function resetPositions() {
    elements.pacman.reset();
    elements.pacman.direction = 'right';
    elements.pacman.image = images.pacmanRight;
    elements.pacman.velocityX = elements.pacman.speed;
    elements.pacman.velocityY = 0;

    elements.ghosts.forEach(ghost => {
        ghost.reset();
        ghost.direction = ghost.getRandomDirection();
        ghost.updateVelocity();
        ghost.scared = false;
        
        
    });
}