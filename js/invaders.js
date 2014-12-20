//invader foo
var game = new Phaser.Game(638, 960, Phaser.CANVAS, 'myInvaders', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('pickup1', 'assets/banana.png');
    game.load.image('bullet1', 'assets/bullet.png');
    game.load.image('bullet2', 'assets/bullet2.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.image('invader1', 'assets/invader_bee.png', 30, 30);
    game.load.image('invader2', 'assets/greenInvader.png', 16, 16);    
    game.load.spritesheet('invader3', 'assets/invader32x32x4.png', 32, 32);
    game.load.image('invader4', 'assets/smiley2.png', 32, 32);
    //game.load.image('invader5', 'assets/evilKitty1.png', 400, 320);
    game.load.spritesheet('invader5', 'assets/anim_evilKitty.png', 400, 320);
    game.load.image('ship', 'assets/player.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield2.png');   
    game.load.image('knightHawks', 'assets/KNIGHT3.png');
    //game.load.image('raidenFonts', 'assets/Raiden Fighters (Seibu).png');
}

var player;
var aliens;
var bulletType;
var bullets;
var bulletTime = 0;
var pickups;
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

    //  Our bullet group. Set bulletType to 1 for default
    bulletType = 1;
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet1');
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

    // pickup items group
    pickups = game.add.group();
    pickups.enableBody = true;
    pickups.physicsBodyType = Phaser.Physics.ARCADE;
    pickups.createMultiple(1,'pickup1');
    pickups.setAll('anchor.x', 0.5);
    pickups.setAll('anchor.y', 1);
    pickups.setAll('outOfBoundsKill', true);
    pickups.setAll('checkWorldBounds', true);

    // create item pickup group
    createPickups(1);

    //  The hero!
    player = game.add.sprite(320, 800, 'ship');    
    player.anchor.setTo(0.5, 0.5);
    // disable texture smoothing to make pixel art stand out
    player.smoothed = false;
    // set the custom invincible property to false by default. Used when respawning for temporary invinciblity.
    player.invincible = false;
    game.physics.enable(player, Phaser.Physics.ARCADE);



    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    aliens.isBoss = false;
    // not sure if this code does anything since I am setting these properties in createAliens function
    aliens.setAll('outOfBoundsKill', true);
    aliens.setAll('checkWorldBounds', true);

    // create randomized alien group
    createAliens(game.rnd.between(1,5));

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


    for (var i = 0; i < 4; i++) 
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

    // Set full screen display. See fullscreen mobile example project for details
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
    
    // set screen size automatically based on the scaleMode. forces fullscreen (works!)
    this.scale.setScreenSize(true);
    
}

function createAliens (alientype) {        
    
    switch (alientype)
    {

        case 3: // alientype 3 is an animated Invader     
            for (var y = 0; y < 4; y++)
            {
                for (var x = 0; x < 10; x++)
                {
                    var alienName = 'invader' + alientype;            
                    var alien = aliens.create(x * 48, y * 50, alienName); 
                    alien.outOfBoundsKill = true;
                    alien.checkWorldBounds = true;
                    alien.anchor.setTo(0.5, 0.5);
                    alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
                    alien.play('fly');
                    alien.body.moves = false;                    
                }
            }
            break;
        
        case 5: // alientype 5 is a boss        
            var alienName = 'invader' + alientype;        
            var alien = aliens.create(180, 50, alienName); 
            alien.isBoss = true;
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('kittyAnim', [ 0, 1, 2, 3 ], 3, true);
            alien.play('kittyAnim');
            alien.body.moves = false;
            aliens.x = 5;
            aliens.y = 50;                    
            break;
        
        default: // alientype default is standard Invader
            for (var y = 0; y < 4; y++)
            {
                for (var x = 0; x < 10; x++)
                {
                    var alienName = 'invader' + alientype;            
                    var alien = aliens.create(x * 48, y * 50, alienName); 
                    alien.outOfBoundsKill = true;
                    alien.checkWorldBounds = true;
                    aliens.x = 5;
                    aliens.y = 50;                    
                }
            }

    }

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.    
    var tweenAliens = game.add.tween(aliens).to( { x: 175 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    
    //  When the tween loops it calls descend
    tweenAliens.onLoop.add(descend, this);       
}


function createPickups (pickupType){
    var pickupName = 'pickup' + pickupType;
    var pickup = pickups.create(48, 0, pickupName);
    pickups.x = 120;
    pickups.y = 375;
    // start the pickup moving by moving the group.
    var tweenPickups = game.add.tween(pickups).to( { x: 150 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);    
    // When the tween loops it calls descend
    tweenPickups.onLoop.add(descendFast, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function descendFast() {

	pickups.y += 40;

}

function update() {

    // continously fire weapon
    if (gameisrunning == 1){
        fireBullet();
    }
    //  Scroll the background
    starfield.tilePosition.y += 3;

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
        player.body.y = game.input.pointer1.y - 100;      
    }

    if (game.input.pointer1.x - player.body.x > 100)
    {
        //TODO: add logic to prevent touch input from teleporting the player ship everywhere. needs to move to the desired coordinates
        //console.log('foo');        
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

    //  Run collision detection
    game.physics.arcade.overlap(bullets, aliens, playerBulletHitsEnemy, null, this);    
    game.physics.arcade.overlap(player, enemyBullets, enemyBulletHitsPlayer, null, this); 
    game.physics.arcade.overlap(player, aliens, enemyBulletHitsPlayer, null, this);   
    game.physics.arcade.overlap(player, pickups, playerTouchesPickup, null, this);

    // check if any aliens are alive
    if (aliens.countLiving() == 0 ){
    	console.log('no aliens alive!');
    }
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function playerBulletHitsEnemy (bullet, alien) {

    // check if enemy is a boss
    if(alien.isBoss == true)
    {
        // TODO: replace hard coded value with property from player bullet
        alien.damage(0.02);
        bullet.kill();                
    }
    //  When a bullet hits a regular alien kill bullet and alien immediately
    else
    {
        bullet.kill();        
        alien.kill();
    }

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
    }

}

function enemyBulletHitsPlayer (player, enemyBullets) {

    // if enemy bullet or ship collides with the player we kill the player
    if (player.invincible == false)
    {
        enemyBullets.kill();

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
            gameisrunning = 0;

            //font.text = 'GAME OVER'

            //stateText.text=" GAME OVER \n Click to restart";
            //stateText.visible = true;

            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);        
        }
        else
        {
            // set game is running to false (0) so that update loop does not fire weapon
            gameisrunning = 0;
            // player is invincible
            player.invincible = true;
            // player ship transparent
            player.alpha = 0.0;
            // reset ship location
            player.body.x = 320;
            player.body.y = 800;
            // player ship to slightly transparent after 2 seconds
            game.time.events.add(Phaser.Timer.SECOND * 2, function(){player.alpha = 0.4; gameisrunning = 1;})            
            // player ship solid and no longer invincible after 5 seconds
            game.time.events.add(Phaser.Timer.SECOND * 5, function(){player.alpha = 1.0; player.invincible = false;})          
            
            

        }
    }
}

function playerTouchesPickup (player, pickup) {

	console.log('you touched the pickup!');
	// kill the pickup
	pickup.kill();	
	// TODO: check what pickup type the player has touched
	// hardcoding this for now: update the bulletType
	bulletType = 2;	
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
        	// check which type of bullet to fire
        	switch (bulletType){
        	case 1: // blue laser
        		bullet.loadTexture('bullet1', 0, false);
        		// TODO: set a property for bullet damage
        		break;
        	case 2: // red laser
        		bullet.loadTexture('bullet2', 0, false);
        		// TODO: set a property for bullet damage
        		break;
        	default: // blue laser
        		bullet.loadTexture('bullet1', 0, false);
        		// TODO: set a property for bullet damage
        		break;
        	}

            //  fire the bullet
            bullet.reset(player.x, player.y - 20);
            bullet.body.velocity.y = -700;
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

    // randomize the enemy type
    game.time.events.add(Phaser.Timer.SECOND * 4, function(){aliens.removeAll(); createAliens(game.rnd.between(1,5));}) 
}

function restart () {
    
    // set boolean game is running to true
    gameisrunning = 1;
    // reset the score
    score = 0;
    //resets the life count
    lives.callAll('revive');
    
    aliens.callAll('kill');
    // remove all the alien bullets
    enemyBullets.callAll('kill');    
    // spawn the first wave of aliens    
    createAliens(game.rnd.between(1,5));
    //revives the player
    player.reset(320, 800, 1);    
}