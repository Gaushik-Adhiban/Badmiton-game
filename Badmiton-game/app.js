var app = angular.module("ShuttleGameApp", []);

app.controller("GameController", function ($scope, $interval, $timeout) {
  let canvas, ctx;
  let paddleHeight = 70, paddleWidth = 10;
  let p1 = { x: 10, y: 150, score: 0 };
  let p2 = { x: 680, y: 150, score: 0 };
  let shuttle = { x: 350, y: 200, radius: 8, dx: 5, dy: 2.5 }; // start slower
  let keys = {};
  let gameInterval;
  const speedIncrement = 0.25, maxSpeed = 50;

  let levelPoints = [15, 10, 5];
  $scope.level = 1;
  $scope.currentLevelPoints = levelPoints[0];
  $scope.p1Score = 0;
  $scope.p2Score = 0;
  $scope.p1LevelWins = 0;
  $scope.p2LevelWins = 0;
  $scope.currentSpeed = 5;
  $scope.showOverlay = false;
  $scope.overlayMessage = '';
  $scope.matchWinner = '';
  $scope.showFireworks = false;

  let lastScorer = null;

  function resetShuttle() {
    shuttle.x = 350;
    shuttle.y = 200;
    const baseSpeed = Math.min(Math.abs(shuttle.dx), maxSpeed); // retain last speed
    const dirX = lastScorer === 'P1' ? -1 : 1;
    shuttle.dx = dirX * baseSpeed;
    shuttle.dy = (Math.random() > 0.5 ? 1 : -1) * baseSpeed / 2;
  }

  function endLevel(winner) {
    if (winner === "Player 1") $scope.p1LevelWins++;
    else $scope.p2LevelWins++;

    $scope.showOverlay = true;
    $scope.overlayMessage = `🎉 ${winner} Wins Level ${$scope.level}!`;

    if ($scope.p1LevelWins === 2 || $scope.p2LevelWins === 2 || $scope.level === 3) {
      $timeout(() => {
        $scope.matchWinner = $scope.p1LevelWins > $scope.p2LevelWins ? "Player 1" : "Player 2";
        $scope.showOverlay = false;
        $scope.showFireworks = true;
      }, 2500);
    } else {
      $timeout(() => {
        $scope.level++;
        $scope.currentLevelPoints = levelPoints[$scope.level - 1];
        $scope.p1Score = 0;
        $scope.p2Score = 0;
        p1.score = 0;
        p2.score = 0;
        resetShuttle();
        $scope.showOverlay = false;
        startLoop();
      }, 2500);
    }
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (keys["w"] && p1.y > 0) p1.y -= 10;
    if (keys["s"] && p1.y < canvas.height - paddleHeight) p1.y += 10;
    if (keys["ArrowUp"] && p2.y > 0) p2.y -= 10;
    if (keys["ArrowDown"] && p2.y < canvas.height - paddleHeight) p2.y += 10;

    ctx.fillStyle = "#4caf50";
    ctx.fillRect(p1.x, p1.y, paddleWidth, paddleHeight);
    ctx.fillStyle = "#f44336";
    ctx.fillRect(p2.x, p2.y, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(shuttle.x, shuttle.y, shuttle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.floor(Math.abs(shuttle.dx * 10) % 360)}, 80%, 50%)`;
    ctx.fill();
    ctx.closePath();

    shuttle.x += shuttle.dx;
    shuttle.y += shuttle.dy;

    if (shuttle.y < 0 || shuttle.y > canvas.height) shuttle.dy = -shuttle.dy;

    if (shuttle.x - shuttle.radius <= p1.x + paddleWidth && shuttle.y > p1.y && shuttle.y < p1.y + paddleHeight) {
      increaseSpeed();
      shuttle.dx = Math.abs(shuttle.dx);
    }

    if (shuttle.x + shuttle.radius >= p2.x && shuttle.y > p2.y && shuttle.y < p2.y + paddleHeight) {
      increaseSpeed();
      shuttle.dx = -Math.abs(shuttle.dx);
    }

    if (shuttle.x < 0) {
      p2.score++;
      $scope.p2Score = p2.score;
      lastScorer = 'P2';
      resetShuttle();
    }

    if (shuttle.x > canvas.width) {
      p1.score++;
      $scope.p1Score = p1.score;
      lastScorer = 'P1';
      resetShuttle();
    }

    if (p1.score >= $scope.currentLevelPoints) {
      $interval.cancel(gameInterval);
      endLevel("Player 1");
    }

    if (p2.score >= $scope.currentLevelPoints) {
      $interval.cancel(gameInterval);
      endLevel("Player 2");
    }

    $scope.currentSpeed = Math.round(Math.abs(shuttle.dx) * 10) / 10;
    $scope.$apply();
  }

  function increaseSpeed() {
    if (Math.abs(shuttle.dx) < maxSpeed) shuttle.dx += (shuttle.dx > 0 ? speedIncrement : -speedIncrement);
    if (Math.abs(shuttle.dy) < maxSpeed) shuttle.dy += (shuttle.dy > 0 ? speedIncrement : -speedIncrement);
  }

  function startLoop() {
    if (gameInterval) $interval.cancel(gameInterval);
    gameInterval = $interval(gameLoop, 20);
  }

  $scope.startGame = function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    document.addEventListener("keydown", (e) => keys[e.key] = true);
    document.addEventListener("keyup", (e) => keys[e.key] = false);

    resetShuttle();
    $scope.matchWinner = '';
    $scope.showFireworks = false;
    startLoop();
  };

  $scope.restartMatch = function () {
    $scope.level = 1;
    $scope.p1LevelWins = 0;
    $scope.p2LevelWins = 0;
    $scope.currentLevelPoints = levelPoints[0];
    $scope.p1Score = 0;
    $scope.p2Score = 0;
    p1.score = 0;
    p2.score = 0;
    $scope.matchWinner = '';
    $scope.showFireworks = false;
    resetShuttle();
    startLoop();
  };

  $scope.startGame();
});