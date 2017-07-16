var canvas = document.getElementById('tetris');
var tet = canvas.getContext('2d');

tet.scale(20, 20);

function arenaSweep(){
    var rowCount = 1;
    outer: for(var i = tetrisArena.length - 1; i > 0; i--){
        for(var j = 0; j < tetrisArena[i].length; j++){
            if(tetrisArena[i][j] === 0){
                continue outer;
            }
        }
        var row = tetrisArena.splice(i, 1)[0].fill(0);
        tetrisArena.unshift(row);
        i++;
        
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


function collide(arena, player){
    var [m, o] = [player.matrix, player.pos];
    for(var y = 0; y < m.length; y++){
        for(var x = 0; x < m[y].length; x++){
            if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0)
                return true;
        }
    }
    return false;
}

function createMatrix(x, y){
    var matrix = [];
    while(y--)
        matrix.push(new Array(x).fill(0));
    return matrix;
}

function createPiece(type){
    if(type === 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]
    }
    else if(type === 'O'){
        return [
            [2, 2],
            [2, 2],
        ];
    }
    else if(type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    }
    else if(type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    }
    else if(type === 'I'){
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    }
    else if(type === 'S'){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }
    else if(type === 'Z'){
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw(){
    tet.fillStyle = "lightblue";
    tet.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMatrix(tetrisArena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                tet.fillStyle = colors[value];
                tet.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
};

function merge(arena, player){
    player.matrix.forEach((row, y) =>{
        row.forEach((value, x) =>{
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop(){
    player.pos.y++;
    if(collide(tetrisArena, player)){
        player.pos.y--;
        merge(tetrisArena, player);
        playerReset();
        arenaSweep();
        player.score += 10;
        updateScore();
    }
    dropCounter = 0;
}

function immediateDrop(){
    player.pos.y++;
    while(!collide(tetrisArena, player))
	player.pos.y++;	
    player.pos.y--;
    merge(tetrisArena, player);
    playerReset();
    arenaSweep();
    player.score += 10;
    updateScore();
}

function playerMove(direction){
    player.pos.x += direction;
    if(collide(tetrisArena, player)){
        player.pos.x -= direction;
    }
}

function playerReset(){
    var pieces = 'TOLJISZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (tetrisArena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if(collide(tetrisArena, player)){
        tetrisArena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
    
}

function playerRotate(direction){
    var pos = player.pos.x;
    var offset = 1;
    rotate(player.matrix, direction);
    while(collide(tetrisArena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, direction){
    var n = matrix.length;
    for(var i = 0; i < (n / 2); i++){
        for(var j = i; j < n-1-i; j++){
            var tmp = matrix[i][j];
            matrix[i][j] = matrix[j][n-i-1];
            matrix[j][n-i-1] = matrix[n-i-1][n-j-1];
            matrix[n-i-1][n-j-1] = matrix[n-j-1][i];
            matrix[n-j-1][i] = tmp;
        }
    }
}

var dropCounter = 0;
var dropInterval = 1000;
var lastTime = 0;

function update(time = 0){
    var deltaTime = time - lastTime;
    lastTime = time;
    
    /*The tetris piece will fall every second*/
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        player.pos.y++;
        dropCounter = 0;
        if(collide(tetrisArena, player)){
            player.pos.y--;
            merge(tetrisArena, player);
            dropCounter = 0;
            arenaSweep();
            playerReset();
            updateScore();
        }
    }
    
    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    var score = document.getElementById('score');
    score.innerText = player.score;
}

var colors = [
    null,
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "violet",
    "pink",
];

var tetrisArena = createMatrix(12, 20);

var player = {
    matrix: null,
    pos: {x: 0, y: 0},
    score: 0,
};


/*Pressing down, left, or right keys*/
document.addEventListener('keydown', event => {
    if(event.keyCode === 37) {
        playerMove(-1);
    }
    else if(event.keyCode === 39){
        playerMove(+1);
    }
    else if(event.keyCode === 40){
        playerDrop();
    }
    else if(event.keyCode === 16){
        playerRotate(-1);
    }
    else if(event.keyCode === 32){
        immediateDrop();
    }
});

playerReset();
updateScore();
update();
