console.log(gsap);
const canvas = document.querySelector("canvas");
const alert = document.querySelector("#alert");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#scoreEl");
const scoreEl2 = document.querySelector("#scoreEl2");
const startBtn = document.querySelector("#startBtn");
const popUp = document.querySelector("#popUp");

canvas.width = innerWidth;
canvas.height = innerHeight;

// CREATING PLAYER
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    };

    draw () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
};

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player (x, y, 10, "white");

// CREATING PROJECTILES
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    };

    draw () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    update () {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
}

let projectiles = [];

// CREATING ENEMIES
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update () {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

let enemies = [];
let enemiesSpeed = 1;
let spawnInterval;
function spawnEnemies() {
    spawnInterval = setInterval(() => {
        if (playerHit) {
            clearInterval(spawnInterval);
            return;
        }
        const radius = Math.random() * (30 - 10) + 10;
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random()*360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);

        const velocity = {
            x: Math.cos(angle) * enemiesSpeed,
            y: Math.sin(angle) * enemiesSpeed
        };

        enemies.push(new Enemy(x, y, radius, color, velocity));
        console.log(enemies);

        if (score > 50) {
            enemiesSpeed = 20;
            alert.style.display = "block";
        };

    }, 1000)
}

// CREATING PARTICLES HIT EFFECT
const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    };

    draw () {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    };

    update () {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    };
}

let particles = [];

// ANIMATING
let animationID;
let score = 0;
function animate() {
    animationID = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        };
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // REMOVING PROJECTILES OUT OF SCREEN
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas. width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }

    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        // PLAYER HIT
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            popUp.style.display = "flex";
            scoreEl2.innerHTML = score;
            playerHit = true;
            cancelAnimationFrame(animationID);
        };

        // PROJECTILE HIT
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1) {

                // SCORING
                score += 30 - Math.ceil(enemy.radius);
                scoreEl.innerHTML = score;

                // PARTICLES EXPLOSIONS
                for (let i = 0; i < enemy.radius*2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }));
                };

                if (enemy.radius - 10 > 5) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            };
        });

    });
};

window.addEventListener("click", (event) => {
    console.log(projectiles);
    const angle = Math.atan2 (event.clientY - canvas.height/2, event.clientX - canvas.width/2);
    console.log(angle);

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };

    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, "white", velocity));
});


// RESTART ALL GAME
function init() {
    player = new Player (x, y, 10, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    enemiesSpeed = 1;
    alert.style.display = "none";
    scoreEl.innerHTML = score;
    scoreEl2.innerHTML = score;
}

// POP UP SETTING
startBtn.addEventListener("click", (event) => {
    playerHit = false;
    init();
    spawnEnemies();
    animate();
    popUp.style.display = "none";
});