(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var GRAVITY = 1800;

function Bomb(game, x, y, options) {
  Phaser.Sprite.call(this, game, x, y, 'bomb');
  this.anchor.setTo(0.5, 0.5);

  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.gravity.y = GRAVITY;

  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

  this.init(options);
}

Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.prototype.constructor = Bomb;

Bomb.prototype.init = function (options) {
  this.body.gravity.y = GRAVITY;
  this.bomberId = options.bomberId;
};

module.exports = Bomb;

},{}],2:[function(require,module,exports){
'use strict';

var EnemyMixin = require('./enemy_common.js');
var Bomb = require('./enemy_bomb.js');
var utils = require('./utils.js');

var INIT_Y = 170;

var currentId = 1;

function BomberEnemy(game, x, y, options) {
  options.image = 'bomber';
  EnemyMixin.call(this, game, x, INIT_Y, options);

  this.bombsGroup = options.throwables;

  this.wings = game.add.sprite(0, 12, 'bomber_wings');
  this.wings.anchor.setTo(0.5, 0.5);
  this.addChild(this.wings);

  this.tweenWings = game.add.tween(this.wings);
  this.tweenWings.to({
    y: this.wings.y + 5
  }, 400, Phaser.Easing.Default, true, 0, -1, true);
}

BomberEnemy.prototype = Object.create(EnemyMixin.prototype);
BomberEnemy.prototype.constructor = BomberEnemy;

BomberEnemy.prototype.SPEED = 180;

BomberEnemy.prototype.init = function (options) {
  EnemyMixin.prototype.init.call(this, options);
  this.y = INIT_Y;

  this.bomberId = currentId++;
};

BomberEnemy.prototype.update = function () {
  if (!this.exists) { return; }

  EnemyMixin.prototype.update.call(this);

  if (!this.dying && this.game.rnd.between(0, 100) < 3) {
    utils.spawnSprite(this.bombsGroup, Bomb, this.x, this.y + 30, {
      bomberId: this.bomberId
    });
  }
};

module.exports = BomberEnemy;

},{"./enemy_bomb.js":1,"./enemy_common.js":3,"./utils.js":8}],3:[function(require,module,exports){
'use strict';

function EnemyMixin (game, x, y, options) {
  options = options || {};

  Phaser.Sprite.call(this, game, x, y, options.image || 'enemy');
  this.anchor.setTo(0.5, 0.5);

  game.physics.enable(this, Phaser.Physics.ARCADE);

  this.checkWorldBounds = true;
  this.events.onOutOfBounds.add(function () {
    if (this.inWorld !== this.lastInWorld) {
      this.flipDirection();
    }
  }, this);

  this.tween = game.add.tween(this);

  this.init(options);
}

EnemyMixin.prototype = Object.create(Phaser.Sprite.prototype);
EnemyMixin.prototype.constructor = EnemyMixin;

// mixin for enemies
EnemyMixin.prototype.init = function (options) {
  this.tween.stop();
  this.alpha = 1;
  this.tint = 0xffffff;

  this.lastInWorld = false;
  this.dying = false;

  this.x = options.side === 'right' ? this.game.world.width + 100 : -100;

  this.move(this.x > 0 ? -1 : 1);
};

EnemyMixin.prototype.move = function (direction) {
  if (direction !== 0) { // -1 or 1 -> move left or right
    var sign = direction > 0 ? 1 : -1;
    this.body.velocity.x = this.SPEED * sign;
    this.scale.x = sign;
  }
  else {
    this.body.velocity.x = 0;
  }
};

EnemyMixin.prototype.flipDirection = function () {
  this.move(this.body.velocity.x > 0 ? -1 : 1);
};

EnemyMixin.prototype.die = function () {
  this.dying = true;
  this.move(0);

  // play dead animation
  this.tween.to({alpha: 0, tint: 0xff0000}, 200);
  this.tween.onComplete.add(this.kill, this);
  this.tween.start();
};

EnemyMixin.prototype.update = function () {
  this.lastInWorld = this.inWorld;
};

EnemyMixin.prototype.SPEED = 100;

module.exports = EnemyMixin;

},{}],4:[function(require,module,exports){
'use strict';

var EnemyMixin = require('./enemy_common.js');

var INIT_Y = 380;

function LandEnemy(game, x, y, options) {
  options.image = 'walker';

  EnemyMixin.call(this, game, x, INIT_Y, options);

  this.hands = game.add.sprite(0, 5, 'walker_hands');
  this.hands.anchor.setTo(0.5, 0.5);
  this.addChild(this.hands);

  this.tweenHands = game.add.tween(this.hands);
  this.tweenHands.to({
    y: this.hands.y + 5
  }, 400, Phaser.Easing.Default, true, 0, -1, true);
}

LandEnemy.prototype = Object.create(EnemyMixin.prototype);
LandEnemy.prototype.constructor = LandEnemy;

LandEnemy.prototype.SPEED = 200;

LandEnemy.prototype.init = function (options) {
  EnemyMixin.prototype.init.call(this, options);
  this.y = INIT_Y;
};

module.exports = LandEnemy;

},{"./enemy_common.js":3}],5:[function(require,module,exports){
'use strict';

var SPEED = 275;
var JUMP_SPEED = 900;
var GRAVITY = 1800;

function Hero(game, x, y) {
  var img = 'hero';

  Phaser.Sprite.call(this, game, x, y, img);
  this.anchor.setTo(0.5, 0.5);


  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = GRAVITY;
  this.body.immovable = true;
  this.body.setSize(this.width / 2, this.height);


  // flames
  this.flames = game.add.emitter(50, 0, 300);
  this.addChild(this.flames);
  this.flames.makeParticles('particle');
  this.flames.gravity = -160;
  this.flames.setXSpeed(10);
  this.flames.setYSpeed(-100, -10);
  this.flames.setAlpha(0.5, 1);
  this.flames.minParticleScale = 0.5;
  this.flames.maxParticleScale = 6;
  this.flames.blendMode = 1;
  this.flames.setAll('tint', 0xffaa33);

  // guitar - sprite child
  this.guitar = game.add.sprite(25, 10, 'guitar');
  this.guitar.anchor.setTo(0.5, 0.5);
  this.guitar.angle = -10;
  game.physics.enable(this.guitar, Phaser.Physics.ARCADE);
  this.guitar.body.setSize(this.guitar.width * 0.8, this.guitar.height);
  this.addChild(this.guitar);

  this.tweenGuitar = game.add.tween(this.guitar);

  this.init();
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
  if (direction !== 0) { // -1 or 1 -> move left or right
    var sign = direction > 0 ? 1 : -1;
    this.body.velocity.x = SPEED * sign;
    this.scale.x = sign;
  }
  else { // 0 -> stop
    this.body.velocity.x = 0;
  }
};

Hero.prototype.jump = function () {
  // only jump when on the ground
  if (this.body.blocked.down) {
    this.body.velocity.y = -JUMP_SPEED;
    return true;
  }
  // TODO: double jump
};

Hero.prototype.init = function () {
  this.tweenGuitar.stop();

  this.tweenGuitar.to({
    y: this.guitar.y + 4
  }, 200, Phaser.Easing.Default, true, 0, -1, true);

  this.flames.start(false, 500, 20);
};


module.exports = Hero;

},{}],6:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    // load here assets required for the preloader screen itself
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // load images
    var images = {
      'background': 'background.png',
      'ground': 'ground.png',
      'hero': 'chara.png',
      'guitar': 'guitar.png',
      'walker': 'enemy00.png',
      'walker_hands': 'enemy00_hands.png',
      'bomber': 'bomber00.png',
      'bomber_wings': 'bomber00_wings.png',
      'bomb': 'bomb00.png',
      'particle': 'particle.png'
    };

    Object.keys(images).forEach(function (key) {
      this.game.load.image(key, 'images/' + images[key]);
    }.bind(this));

    // load sfx
    var sfx = {
      'jump': 'chara_jump.wav',
      'hit': 'hit.wav',
      'pickup': 'pickup.wav',
      'next_wave': 'next_wave.wav',
      'gameover': 'gameover.wav',
      'background': 'soundtrack.ogg'
    };
    Object.keys(sfx).forEach(function (key) {
      this.game.load.audio(key, 'audio/' + sfx[key]);
    }.bind(this));

    // TODO: load sfx
  },

  create: function () {
    this.game.state.start('play');
  }
};

function startGame() {
  var game = new Phaser.Game(900, 500, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
}

window.onload = function () {
  // for dev mode
  // document.querySelector('.overlay').style.display = 'none';
  // startGame();

  // for production

  document.getElementById('play').addEventListener('click', function (evt) {
    evt.preventDefault();
    // hide overlay
    document.querySelector('.overlay').style.display = 'none';
    // start game!
    startGame();
  });
};

},{"./play_scene.js":7}],7:[function(require,module,exports){
'use strict';

var Hero = require('./hero.js');
var LandEnemy = require('./enemy_land.js');
var BomberEnemy = require('./enemy_bomber.js');
var Wave = require('./wave.js');

var GREEN = '#aded4f';
var RED = '#e40f00';

function setupWaves(group, throwables) {
  return [
    new Wave([
      {offset: 0, klass: LandEnemy, side: 'right'},
      {offset: 500, klass: LandEnemy, side: 'right'}
    ], group, throwables),

    new Wave([
      {offset: 0, klass: LandEnemy, side: 'right'},
      {offset: 200, klass: LandEnemy, side: 'right'},
      {offset: 200, klass: LandEnemy, side: 'left'},
      {offset: 1000, klass: BomberEnemy, side: 'right'},
    ], group, throwables),

    new Wave([
      {offset: 0, klass: LandEnemy, side: 'right'},
      {offset: 100, klass: LandEnemy, side: 'left'},
      {offset: 300, klass: LandEnemy, side: 'right'},
      {offset: 1000, klass: LandEnemy, side: 'left'},
      {offset: 1300, klass: LandEnemy, side: 'right'},
      {offset: 1310, klass: LandEnemy, side: 'left'},
      {offset: 1310, klass: LandEnemy, side: 'left'},
      {offset: 2000, klass: BomberEnemy, side: 'right'},
      {offset: 2650, klass: LandEnemy, side: 'right'},
      {offset: 2700, klass: LandEnemy, side: 'left'}
    ], group, throwables),

    new Wave([
      {offset: 0, klass: LandEnemy, side: 'right'},
      {offset: 100, klass: LandEnemy, side: 'left'},
      {offset: 300, klass: LandEnemy, side: 'right'},
      {offset: 1000, klass: BomberEnemy, side: 'left'},
      {offset: 1300, klass: BomberEnemy, side: 'right'},
      {offset: 1310, klass: LandEnemy, side: 'left'},
      {offset: 1310, klass: LandEnemy, side: 'left'},
      {offset: 2000, klass: BomberEnemy, side: 'right'},
    ], group, throwables),

    new Wave([
      {offset: 0, klass: LandEnemy, side: 'right'},
      {offset: 100, klass: LandEnemy, side: 'left'},
      {offset: 200, klass: LandEnemy, side: 'right'},
      {offset: 500, klass: BomberEnemy, side: 'left'},
      {offset: 1300, klass: LandEnemy, side: 'left'},
      {offset: 1300, klass: BomberEnemy, side: 'left'},
      {offset: 1500, klass: LandEnemy, side: 'right'},
    ], group, throwables)
  ];
}

function enemiesVsHero(hero) {
  hero.kill();
  hero.guitar.kill();
  this.sfx.hit.play();
}

var isGameOver = false;

var PlayScene = {
  create: function () {
    this.sfx = {
      jump: this.game.add.audio('jump'),
      hit: this.game.add.audio('hit'),
      pickup: this.game.add.audio('pickup'),
      next: this.game.add.audio('next_wave'),
      gameover: this.game.add.audio('gameover')
    };
    this.soundtrack = this.game.add.audio('background');
    this.soundtrack.loopFull(0.8);

    // setup physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 900, 430);

    // setup decoration
    this.background = this.game.add.sprite(0, 0, 'background');
    this.ground = this.game.add.sprite(0, 500, 'ground');
    this.ground.anchor.setTo(0, 1);

    // setup enemies
    // see how I digged my own grave because I didn't use composition :_(
    this.enemyThrowables = this.game.add.group();
    this.enemies = this.game.add.group();

    // create main character
    this.hero = new Hero(this.game, 300, 200);
    this.game.add.existing(this.hero);

    // setup input keys
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.up.onDown.add(function () {
      if (this.hero.alive && this.hero.jump()) {
        this.sfx.jump.play();
      }
    }.bind(this));

    // game over and victory
    this.hero.events.onKilled.add(this.gameOver, this);

    // spawn enemies
    this.spawnLevel();

    isGameOver = false;

    // setup UI
    this.ui = this.game.add.group();
    this.createUI();
  },

  createUI: function () {
    var fontStyle = {
      font: '40px Bangers',
      fill: GREEN
    };

    this.waveText = this.game.add.text(10, 0, 'Wave #1 ', fontStyle);
    this.waveText.setShadow(-4, 4, '#000', 0);
    this.ui.add(this.waveText);


    this.nextWaveText = this.game.add.text(450, 140, ' Next wave! ', {
      font: '50px Bangers',
      fill: GREEN
    });
    this.nextWaveText.anchor.setTo(0.5, 0.5);
    this.nextWaveText.setShadow(-4, 4, '#000', 0);
    this.nextWaveText.visible = false;

    this.ui.add(this.nextWaveText);
  },

  spawnLevel: function () {
    this.currentWave = 0;
    this.waves = setupWaves(this.enemies, this.enemyThrowables);

    // start the first wave
    if (this.waves.length > 0) {
      this.waves[0].start();
    }
  },

  update: function () {
    this.updateInput();
    this.detectCollisions();

    // check for end of wave
    if (!isGameOver && this.waves.length > 0 &&
    this.enemies.countLiving() === 0 &&
    this.waves[this.currentWave].depleted) {
      this.sfx.next.play();
      // all waves finished?
      if (this.currentWave >= this.waves.length - 1) {
        this.victory();
      }
      else { // still waves to go…
        this.nextWave();
      }
    }
  },

  updateInput: function () {
    if (this.keys.left.isDown) {
      this.hero.move(-1);
    }
    else if (this.keys.right.isDown) {
      this.hero.move(1);
    }
    else {
      this.hero.move(0);
    }
  },

  detectCollisions: function () {
    // guitar can kill enemies
    this.game.physics.arcade.overlap(this.hero.guitar, this.enemies,
    function (hero, enemy) {
      enemy.die();
      this.sfx.hit.play();
      // destroy bombers' bombs
      if (enemy.bomberId) {
        this.enemyThrowables.forEachAlive(function (x) {
          if (x.bomberId === enemy.bomberId) {
            x.kill();
          }
        });
      }
    }, function (hero, enemy) {
      return !enemy.dying;
    }, this);

    // enemies can kill hero
    this.game.physics.arcade.overlap(this.hero, this.enemies, enemiesVsHero,
    function (hero, enemy) { // process function
      return !enemy.dying;
    }, this);

    // enemy throwables can kill hero too
    this.game.physics.arcade.overlap(this.hero, this.enemyThrowables,
    enemiesVsHero, function (hero, enemy) { // process function
      return !enemy.dying;
    }, this);
  },

  gameOver: function () {
    // TODO: proper game over plz
    console.log('** game over **');

    isGameOver = true;
    this.sfx.gameover.play();

    // create game over text
    var banner = this.game.add.text(450, 200, ' Game Over ', {
      font: '60px Bangers',
      fill: GREEN
    });
    banner.anchor.set(0.5, 0.5);
    banner.setShadow(-4, 4, '#000', 0);

    // create misc text
    var button = this.game.add.text(450, 260, '- click to restart -', {
      font: '24px Courier, "Courier New", monospace',
      fill: '#fff'
    });
    button.anchor.set(0.5, 0.5);
    button.setShadow(-2, 2, '#000', 0);
    button.inputEnabled = true;
    button.input.useHandCursor = true;
    button.events.onInputUp.add(function () {
      this.wrathOfGod();
      this.game.state.restart(true, false); // restart the game for now
    }, this);
    button.events.onInputOver.add(function () {
      button.fill = RED;
    }, this);
    button.events.onInputOut.add(function () {
      button.fill = '#fff';
    });

    this.ui.add(banner);
    this.ui.add(button);
  },

  victory: function () {
    // TODO: proper victory plz with fireworks and particles and…
    console.log('** victory **');
    isGameOver = true;

    // Yes, REPEATED from gameOver but it's late and I DON'T CARE :)

    // create game over text
    var banner = this.game.add.text(450, 200, ' Victory! ', {
      font: '60px Bangers',
      fill: GREEN
    });
    banner.anchor.set(0.5, 0.5);
    banner.setShadow(-4, 4, '#000', 0);

    // create misc text
    var button = this.game.add.text(450, 260, '- click to restart -', {
      font: '24px Courier, "Courier New", monospace',
      fill: '#fff'
    });
    button.anchor.set(0.5, 0.5);
    button.setShadow(-2, 2, '#000', 0);
    button.inputEnabled = true;
    button.input.useHandCursor = true;
    button.events.onInputUp.add(function () {
      this.wrathOfGod();
      this.game.state.restart(true, false); // restart the game for now
    }, this);
    button.events.onInputOver.add(function () {
      button.fill = RED;
    }, this);
    button.events.onInputOut.add(function () {
      button.fill = '#fff';
    });

    this.ui.add(banner);
    this.ui.add(button);
  },

  nextWave: function () {
    this.currentWave++;
    this.waves[this.currentWave].start();
    // update UI
    this.waveText.setText('Wave #' + (this.currentWave + 1) + ' ');

    this.nextWaveText.visible = true;
    this.nextWaveText.alpha = 1;
    var tween = this.game.add.tween(this.nextWaveText);
    tween.to({alpha: 0}, 100, Phaser.Easing.LINEAR, false, 0, 4, true)
      .to({alpha: 0}, 300, Phaser.Easing.LINEAR, false, 400);

    tween.onComplete.add(function () {
      this.nextWaveText.visible = false;
    }, this);

    tween.start();
  },

  wrathOfGod: function () {
    // clean up previous waves (and their events)
    if (this.waves) {
      this.waves.forEach(function (wave) {
        wave.destroy();
      });
    }

    this.enemies.removeChildren();
    this.soundtrack.stop();
  }
};

module.exports = PlayScene;

},{"./enemy_bomber.js":2,"./enemy_land.js":4,"./hero.js":5,"./wave.js":9}],8:[function(require,module,exports){
'use strict'  ;

module.exports = {
  // from http://youmightnotneedjquery.com
  extend: function (out) {
    /*jshint -W073 */
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) { continue; }

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          out[key] = arguments[i][key];
        }
      }
    }

    return out;
    /*jshint +W073 */
  },

  spawnSprite: function (group, klass, x, y, options) {
    // get the first instance that exists OF THE SAME TYPE
    var instance = null;
    group.iterate('exists', false, Phaser.Group.RETURN_CHILD, function (x) {
      if (!instance && x instanceof klass) {
        instance = x;
      }
    }, this);
    // var instance = group.getFirstExists(false);

    // reuse existing slot if available
    if (instance) {
      instance.reset(x, y);
      if (instance.init) { instance.init(options); }
    }
    // if there is no slot available, create a new sprite
    else {
      /*jshint -W055 */
      group.add(new klass(group.game, x, y, options));
      /*jshint +W055 */
    }
  }
};

},{}],9:[function(require,module,exports){
'use strict';

var utils = require('./utils.js');

function Wave(data, group, throwablesGroup) {
  this.timer = group.game.time.create(true);

  data.forEach(function (enemy) {
    this.timer.add(enemy.offset, function () {
      utils.spawnSprite(group, enemy.klass, 0, 0, {
        side: enemy.side,
        throwables: throwablesGroup
      });
    }, this);
  }.bind(this));

  this.onDepleted = new Phaser.Signal();

  this.timer.onComplete.add(function () {
    this.timer = null;
    this.onDepleted.dispatch(this);
    this.depleted = true;
  }, this);
}

Wave.prototype.start = function () {
  this.timer.start();
};

Wave.prototype.destroy = function () {
  if (this.timer) {
    this.timer.destroy();
    this.timer = null;
  }
};

module.exports = Wave;

},{"./utils.js":8}]},{},[6]);
