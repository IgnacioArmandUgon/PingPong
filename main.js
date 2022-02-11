(function() {
    self.Board = function(width, height) { //ancho y alto de pizarrón
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    }

    self.Board.prototype = { // método getter para los elementos de Board
        get elements() {
            var elements = this.bars.map(function(bar) {
                return bar;
            });
            elements.push(this.ball);
            return elements;
        }
    }
})();

(function() {
    self.Ball = function(x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        this.direction = 1; //1 = izquierda, -1 = derecha
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;

        board.ball = this;
        this.kind = "circle";
    }

    self.Ball.prototype = {
        move: function() {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);

        },
        get width() {
            return this.radius * 2;

        },
        get height() {
            return this.radius * 2;

        },


        collision: function(bar) { //Reacciona a la colisiona con una barra que recibe como parametro  

            var relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;

            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) {
                this.direction = -1;
                this.speed += 1;
            } else {
                this.direction = 1;
                this.speed += 1;
            }

        },

        wall: function() {
            this.speed_y = -this.speed_y;
        },

        gol: function() {
            board.playing = !board.playing;
            ball.reset();

        },

        reset: function() {
            this.x = board.width / 2;
            this.y = board.height / 2;
        }

    }

})();

(function() {
    self.Bar = function(x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 10;
    }

    self.Bar.prototype = {
        down: function() {
            this.y += this.speed;

        },
        up: function() {
            this.y -= this.speed;
        },
        toString: function() {
            return "x: " + this.x + "y: " + this.y;
        }
    }
})();
(function() {
    self.BoardView = function(canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.cxt = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        clean: function() {
            this.cxt.clearRect(0, 0, this.board.width, this.board.height);
        },
        draw: function() {
            for (var i = this.board.elements.length - 1; i >= 0; i--) {
                var el = this.board.elements[i];

                draw(this.cxt, el);
            };
        },
        check_collisions: function() {
            for (var i = this.board.bars.length - 1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if (hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);

                }
            };

        },
        check_wall: function() { //Metodo que comprueba que la bola tocó un borde superior o inferior
            var ball = this.board.ball;
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.wall();
            }

        },
        check_gol: function() { //Metodo que comprueba si la bola tocó un borde izquierdo o derecho
            var ball = this.board.ball;
            if (ball.x - ball.radius < 0) {
                ball.gol();
            } else if (ball.x + ball.radius > canvas.width) {
                ball.gol();
            }
        },
        play: function() {
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.check_wall();
                this.check_gol();
                this.board.ball.move();
            }
        }

    }

    function hit(a, b) {
        //ver si a colisiona con b
        var hit = false;
        //Colisiones hirizontales
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {

            //Colisiones verticales
            if (b.y + b.height >= a.y && b.y < a.y + a.height)
                hit = true;
        }

        //Colisión de a con b
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {

            if (b.y <= a.y && b.y + b.height >= a.y + a.height)
                hit = true;
        }

        //Colision de b con a
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            //Colisiones verticales
            if (a.y <= b.y && a.y + a.height >= b.y + b.height)
                hit = true;
        }
        return hit;
    }

    function draw(cxt, element) {

        switch (element.kind) {
            case "rectangle":
                cxt.fillRect(element.x, element.y, element.width, element.height);
                break;

            case "circle":
                cxt.beginPath();
                cxt.arc(element.x, element.y, element.radius, 0, 7);
                cxt.fill();
                cxt.closePath();
                break;
        }
    }
})();

var board = new Board(800, 400);
var bar = new Bar(-30, 150, 60, 100, board);
var bar_2 = new Bar(770, 150, 60, 100, board);
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas, board);
var ball = new Ball(board.width / 2, board.height / 2, 10, board);

document.addEventListener("keydown", function(ev) {
    console.log(ev.keyCode);
    if (ev.keyCode == 87) {
        ev.preventDefault();
        bar.up();
    } else if (ev.keyCode == 83) {
        ev.preventDefault();
        bar.down();
    } else if (ev.keyCode == 38) {
        ev.preventDefault();
        bar_2.up();
    } else if (ev.keyCode == 40) {
        ev.preventDefault();
        bar_2.down();
    } else if (ev.keyCode === 32) {
        ev.preventDefault();
        board.playing = !board.playing;

    }
});

board_view.draw();
window.requestAnimationFrame(controller);
setTimeout(function() {
    ball.direction = -2;
}, 4000);

function controller() {
    board_view.play();
    window.requestAnimationFrame(controller);

}