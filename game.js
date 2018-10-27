enchant();

enemies = [];
function removeDeath(enemy) {
    return enemies.filter(function (e) {
        return e != enemy;
    })
}

Bullet = Class.create(Sprite, {
    initialize: function (x, y, vx, vy, stage) {
        Sprite.call(this, 16, 16);
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.image = game.assets['icon0.png'];
        this.frame = 54;
        this.damage = 20;
        this.rotate(Math.atan(this.vy / this.vx) * 180 / Math.PI)
        stage.addChild(this);
    },
    onenterframe: function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x > 320) {
            this.remove();
        }
        for (let i = 0; i < enemies.length; i++) {
            if (this.intersect(enemies[i])) {
                enemies[i].onHit(this.damage);
                this.remove();
                break;
            }
        }
    }
})

Enemy = Class.create(Sprite, {
    initialize: function () {
        Sprite.call(this, 32, 32);
        this.x = game.width - 1;
        this.y = getRandomIntExclusive(0, game.height - this.height);
        this.type = getRandomIntExclusive(0, 4);
        this.vx = -2;
        this.vy = 0;
        this.walk = 0;
        this.isMoving = true;
        this.image = game.assets['bears.png'];
        this.hp = this.maxHp = this.type * 200;
        this.in = true;
        this.moveOffset = 1;
        stage.addChild(this);
    },
    onenterframe: function () {
        if (this.hp <= 0) {
            this.isMoving = false;
            enemies = removeDeath(this);
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.isMoving) {
            this.x += this.vx;
            this.y += this.vy;
            this.frame = this.type * 4 + this.walk + this.moveOffset;
            if ((game.frame % 3) == 0) {
                this.walk++;
                this.walk %= 2;
            }
        }
        if (!this.in) {
            if (((this.x + this.width) > game.width) || (this.x <= 0)) {
                this.vx *= -1;
            }
        } else {
            if (this.x <= 0) {
                this.in = false;
            }
        }
    },
    onHit: function (damage) {
        this.hp -= damage;
    },
    onDeath: function () {
        this.isMoving = false;
    }
})

function getRandomIntExclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getSign(n) {
    var sign = n / Math.abs(n);
    return sign;
}

window.onload = function () {
    game = new Game(320, 320);
    game.keybind(32, 'a');
    game.fps = 24;
    game.preload('spaceship.png', 'bears.png');

    const MAX_VX = game.width / game.fps / 3;
    const MAX_VY = game.height / game.fps / 2;
    const FRICTION_VELOCITY = 2;

    function setPlayer() {
        player = new Sprite(16, 16);
        var image = new Surface(16, 16);
        image.draw(game.assets['spaceship.png']);
        player.image = image;
        player.x = player.width;
        player.y = game.height / 2 - player.height / 2;
        player.power = 0;
        player.bulletType = 0;
        player.vx = 0;
        player.vy = 0;

        player.addEventListener('enterframe', function () {
            var xSign = this.vx / Math.abs(this.vx);
            if (Math.abs(this.vx) > MAX_VX) {
                this.vx = MAX_VX * xSign;
            }
            var ySign = this.vy / Math.abs(this.vy);
            if (Math.abs(this.vy) > MAX_VY) {
                this.vy = MAX_VY * ySign;
            }
            if (this.vx !== 0) {
                this.x = this.x + this.vx;
            }
            if (this.vy !== 0) {
                this.y = this.y + this.vy;
            }

            if (game.input.left) {
                this.vx -= 2;
            } else if (game.input.right) {
                this.vx += 2;
            }
            if (game.input.up) {
                this.vy -= 2;
            } else if (game.input.down) {
                this.vy += 2;
            }

            if (!game.input.left && !game.input.right) {
                if (this.vx != 0) {
                    var i = getSign(this.vx);
                    this.vx = this.vx - i * FRICTION_VELOCITY;
                    if (i != getSign(this.vx)) {
                        this.vx = 0;
                    }
                }
            }
            if (!game.input.up && !game.input.down) {
                if (this.vy != 0) {
                    var i = getSign(this.vy);
                    this.vy = this.vy - i * FRICTION_VELOCITY;
                    if (i != getSign(this.vy)) {
                        this.vy = 0;
                    }
                }
            }

            if (game.input.a) {
                var x = this.x + this.width;
                var y = this.y;
                if (game.frame % 3 == 0) {
                    new Bullet(x, y, 6, -1, stage)
                    new Bullet(x, y, 6, -0.5, stage)
                    new Bullet(x, y, 6, 0, stage)
                    new Bullet(x, y, 6, 0.5, stage)
                    new Bullet(x, y, 6, 1, stage)
                }
            }

        })
    }

    game.onload = function () {


        game.rootScene.addEventListener('enterframe', function () {
            if (!(game.frame %= 6) && enemies.length < 10) {
                enemies.push(new Enemy());
            }
        })

        stage = new Group();
        game.rootScene.addChild(stage)
        game.rootScene.addChild(player);
    }

    game.start();

}