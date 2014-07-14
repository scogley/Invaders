//invader foo
var game = new Phaser.Game(640, 960, Phaser.AUTO, 'myInvaders', { preload: preload, create: create, update: update, render: render });

function preload() {

    //game.load.image('bullet', 'assets/banana.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('invader3', 'assets/invader32x32x4.png', 32, 32);
    game.load.image('invader2', 'assets/greenInvader.png', 16, 16);
    game.load.image('invader1', 'assets/smiley.png', 16, 16);
    game.load.image('ship', 'assets/player.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield2.png');   
    game.load.image('knightHawks', 'assets/KNIGHT3.png');
    //game.load.image('raidenFonts', 'assets/Raiden Fighters (Seibu).png');


}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
var waveCount = 1;
var gameisrunning = 1;
var font;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 640, 1920, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens('invader1');

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  Text
    // stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    // stateText.anchor.setTo(0.5, 0.5);
    // stateText.visible = false;

    font = game.add.retroFont('knightHawks', 31, 25, Phaser.RetroFont.TEXT_SET6, 10, 1, 1);
    var c = 0;
    game.add.image(game.world.centerX, c, font);    


    // for (var c = 0; c < 19; c++)
    // {
    //     var i = game.add.image(game.world.centerX, c * 32, font);
    //     i.tint = Math.random() * 0xFFFFFF;
    //     i.anchor.set(0.5, 1);
    // }


    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    pointer1 = game.input.addPointer();    
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // set full screen display. See fullscreen mobile example project for details
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.minWidth = 480;
    this.scale.minHeight = 260;
    this.scale.maxWidth = 640;
    this.scale.maxHeight = 960;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.forceOrientation(true, false);
    //this.scale.hasResized.add(this.gameResized, this);
    //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
    //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
    //this.scale.setScreenSize(true);
    this.scale.startFullScreen(false);
}

function createAliens (alientype) {    
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            // var alien = aliens.create(x * 48, y * 50, 'invader');
            var alien = aliens.create(x * 48, y * 50, alientype);
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function update() {

    // continously fire weapon
    if (gameisrunning == 1){
        fireBullet();
    }
    //  Scroll the background
    starfield.tilePosition.y += 2;

    //  Reset the player, then check for movement keys
    player.body.velocity.setTo(0, 0);
    // Movement keyboard
    if (cursors.left.isDown)
    {
        player.body.velocity.x = -400;
    }
    if (cursors.right.isDown)
    {
        player.body.velocity.x = 400;
    }
    if (cursors.up.isDown)
    {
        player.body.velocity.y = -400;
    }

    if (cursors.down.isDown)
    {
        player.body.velocity.y = 400;
    }

    // set x and y location based on touch input
    if (game.input.pointer1.isDown)
    {
        player.body.x =  game.input.pointer1.x;  
        player.body.y = game.input.pointer1.y;      
    }

    //  Firing keyboard?
    if (fireButton.isDown)
    {
        fireBullet();
    }

    if (game.time.now > firingTimer)
    {
        enemyFires();
    }

    //  Run collision
    game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
    game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);    

    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        loadNextWave(this);
        // stateText.text = " You Won, \n Click to restart";
        // stateText.visible = true;

        // //the "click to restart" handler
        // game.input.onTap.addOnce(restart,this);
    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');
        gameisrunning = 0;

        font.text = 'GAME OVER'

        //stateText.text=" GAME OVER \n Click to restart";
        //stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);        
    }

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,300);
        firingTimer = game.time.now + 300;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y - 20);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function loadNextWave () {

    //  And brings the aliens back from the dead :)    
    waveCount ++;
    font.text = 'Incoming Wave' + waveCount;
    //stateText.text = " Incoming Wave " + waveCount;
    //stateText.visible = true;  
    var invaderName = 'invader' + waveCount;
    // set a timer to spawn the next wave of baddies and hide the text
    game.time.events.add(Phaser.Timer.SECOND * 4, function(){font.text = '';aliens.removeAll(); createAliens(invaderName);})    
    
}

function restart () {
    // set boolean game is running to true
    gameisrunning = 1;
    // hide the game over font text
    font.text = '';    
    // reset the score
    score = 0;
    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    // remove all the alien bullets
    enemyBullets.callAll('kill');    
    // spawn the first wave of aliens    
    createAliens('invader1');
    //revives the player
    player.revive();
    // reset starting position
    // player.body.x = 400;
    // player.body.y = 500;
    

}
