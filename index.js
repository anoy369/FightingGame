
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/background.png'
})

const shop = new Sprite({
    position: {
        x: 780,
        y: 250
    },
    imageSrc: './assets/shop.png',
    scale: 2,
    framesMax: 6
})

const player = new Fighter({
    position: {
        x: 250,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/player1/idle.png',
    scale: 3,
    framesMax: 8,
    offset: {
        x: 300,
        y: 200
    },
    sprites: {
        idle: {
            imageSrc: './assets/player1/idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './assets/player1/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './assets/player1/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './assets/player1/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './assets/player1/Attack1.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './assets/player1/Take Hit - white silhouette.png',
            framesMax: 4,
        }
    },
    attackBox: {
        offset: {
            x: 0,
            y: 50
        },
        width: 270,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 700,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './assets/player2/idle.png',
    scale: 3,
    framesMax: 4,
    offset: {
        x: 300,
        y: 220
    },
    sprites: {
        idle: {
            imageSrc: './assets/player2/idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './assets/player2/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './assets/player2/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './assets/player2/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './assets/player2/Attack1.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './assets/player2/Take hit.png',
            framesMax: 3,
        }
    },
    attackBox: {
        offset: {
            x: -270,
            y: 50
        },
        width: 270,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

// Player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    } else {
        player.switchSprite('idle')
    }
// Enemy Movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5        
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    }else if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    } else {
        enemy.switchSprite('idle')
    }

    //detect for collusion for player
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    }

    // missed attack

    if(player.isAttacking && player.framesCurrent === 4 ){
        player.isAttacking = false
    }

    //detect for collusion for enemy
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) && 
        enemy.isAttacking && enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

    // missed attack

     if(enemy.isAttacking && enemy.framesCurrent === 2 ){
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId})
    }
}

animate()

window.addEventListener('keydown', (event) => {
    switch(event.key) {
        // player Keys
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
        break
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
        break
        case 'w':
            player.velocity.y = -20
        break
        case ' ':
            player.attack()
        break

        // enemy keys
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
        break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
        break
        case 'ArrowUp':
            enemy.velocity.y = -20
        break
        case 'ArrowDown':
            enemy.attack()
        break
    }
})

window.addEventListener('keyup', (event) => {

    // player keys
    switch(event.key) {
        case 'd':
            keys.d.pressed = false
        break
        case 'a':
            keys.a.pressed = false
        break
    }

    // enemy keys
    switch(event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
        break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
        break
    }
})