// Miscellaneous utilities /////////////////////////////////////////////////////

var randn = function ( mu, sigma ) {
   var u = 0, v = 0;
   while ( u == 0 ) u = Math.random();
   while ( v == 0 ) v = Math.random();
   return Math.sqrt ( -2.0 * Math.log(u) ) * Math.cos ( 2.0 * Math.PI * v ) * sigma + mu;
}

// Global graphics /////////////////////////////////////////////////////////////

var font = 0;

// Number of available options for each part. The values imply that the
// corresponding member of a monster can take any integer value from 1 to num-1
const colorNumber = 3;
const eyesNumber = 5;
const nosesNumber = 4;
const mouthsNumber = 5;
const earsNumber = 3;
const extraNumber = 3;

// Size of the reference frame. Used to crop sprite sheets. Pixels
const frameWidth = 150;
const frameHeight = 216;
const brickWidth = 84;
const brickHeight = 48;
const paddleHeight = 27;

// Positioning of the selected frame
const selFrameDX = -6;
const selFrameDY = -6;

// Images to be loaded
var imgFrame = 0;
var imgFrameSelected = 0;
var imgBody = 0;
var imgEyes = 0;
var imgNose = 0;
var imgMouth = 0;
var imgEars = 0;
var imgExtra = 0;
var imgHPbar = 0;
var imgBricks = 0;
var imgPaddle = 0;
var imgBall = 0;

// Loads an array of images from a folder
var loadImagesArray = function ( folder, n ) {
   var result = new Array();

   for ( var i = 0; i < n; ++i ) {
      result.push ( new Image() );
      result[i].src = folder + "/" + (i+1) + ".png";
   }

   return result;
}

// Function to preload all images
var loadImages = function ( ) {
   imgFrame = new Image(); imgFrame.src = "./gfx/frame.png";
   imgFrameSelected = new Image(); imgFrameSelected.src = "./gfx/frame_selected.png";
   imgBody = new Image(); imgBody.src = "./gfx/body.png";
   imgHPbar = new Image(); imgHPbar.src = "./gfx/healthbar.png";
   imgBricks = new Image(); imgBricks.src = "./gfx/bricks.png";
   imgPaddle = new Image(); imgPaddle.src = "./gfx/paddles.png";
   imgBall = new Image(); imgBall.src = "./gfx/ball.png";

   imgEyes = loadImagesArray ( "./gfx/eyes", eyesNumber );
   imgNose = loadImagesArray ( "./gfx/noses", nosesNumber );
   imgMouth = loadImagesArray ( "./gfx/mouths", mouthsNumber );
   imgEars = loadImagesArray ( "./gfx/ears", earsNumber );
   imgExtra = loadImagesArray ( "./gfx/extra", extraNumber );
}

// Draw health bar
var hpBar = function ( ctxt, x, y, w, fill ) {
   if ( fill <= 0 ) return;

   ctxt.drawImage ( imgHPbar, 0, 0, 3, 9, x, y, 3, 9 ); // Begin
   for ( var i = 3; i < w * fill - 3; i += 3 ) // Middle part
      ctxt.drawImage ( imgHPbar, 3, 0, 3, 9, x + i, y, 3, 9 );
   ctxt.drawImage ( imgHPbar, 15, 0, 3, 9, x + Math.floor(w*fill/3-1)*3, y, 3, 9 ); // End
}

// Game logic //////////////////////////////////////////////////////////////////

const paddleAccel = 20; // Paddle acceleration [pixels/s^2]
const paddleDamp = 0.05; // Paddle damping factor [

var names = new RandName ( [ [ "Green ", "Blue ", "Red " ], // Color
                             [ "S", "R", "T", "W", "M" ], // Eyes
                             [ "ao", "oo", "oi", "e" ], // Nose
                             [ "ck", "t", "r", "n", "v" ], // Mouth,
                             [ "i", "ar", "eb" ], // Ears
                             [ "bull", "hog", "ler" ] ] ); // Extra

// Monster class
var Monster = function ( ) {
   // Misc info ////////////////////////////////////////////////////////////////
   this.name = "";

   // Graphics /////////////////////////////////////////////////////////////////
   this.color = 0;

   // Each of the parts is determined by an index
   this.eyes = 0;
   this.nose = 0;
   this.mouth = 0;
   this.ears = 0;
   this.extra = 0;

   // Draws the monster
   //    ctxt: context to draw on
   //    x,y: coordinates for the upper-left corner of the frame
   this.draw = function ( ctxt, x, y ) {
      ctxt.drawImage ( imgBody, this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Body
      ctxt.drawImage ( imgExtra[this.extra], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Extra
      ctxt.drawImage ( imgEyes[this.eyes], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Eyes
      ctxt.drawImage ( imgMouth[this.mouth], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Mouth
      ctxt.drawImage ( imgNose[this.nose], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Nose
      ctxt.drawImage ( imgEars[this.ears], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Ears
   }

   // Statistics ///////////////////////////////////////////////////////////////
   this.maxHP = 10;
   this.hp = 10;

   this.atk = 10;
   this.def = 10;
   this.reg = 0;

   // Miscellaneous ////////////////////////////////////////////////////////////

   // Randomly assigns values to the monster parts
   this.randomizeParts = function ( ) {
      this.color = Math.floor ( Math.random() * colorNumber );
      this.eyes = Math.floor ( Math.random() * eyesNumber );
      this.nose = Math.floor ( Math.random() * nosesNumber );
      this.mouth = Math.floor ( Math.random() * mouthsNumber );
      this.ears = Math.floor ( Math.random() * earsNumber );
      this.extra = Math.floor ( Math.random() * extraNumber );
      this.name = names.get ( [ this.color, this.eyes, this.nose, this.mouth, this.ears, this.extra ] );
   }

   // Randomly assigns values to the stats
   this.randomizeStats = function ( base, sd ) {
      this.maxHP = this.atk = this.def = -1;
      while ( this.maxHP <= 0 ) this.maxHP = Math.round ( randn ( base, sd ) );
      while ( this.atk <= 0 ) this.atk = Math.round ( randn ( base, sd ) );
      while ( this.def <= 0 ) this.def = Math.round ( randn ( base, sd ) );
      this.reg = Math.floor ( Math.exp( randn ( 0, sd/50 ) ) );

      this.hp = this.maxHP;
   }

   // Monster info text
   this.info = function ( ) {
      return this.name + "\n\nhp: " + this.hp + "/" + this.maxHP + "\natk: " + this.atk + "\ndef: " + this.def + "\nreg: " + this.reg;
   }
}

// Fight between two monsters
// Returns 0 if nobody dies, 1 if A dies (even if B dies), 2 if B dies (but A doesn't)
var fight = function ( a, b ) {
   var dmgA = b.atk - a.def;
   if ( dmgA <= 0 ) dmgA = 1;

   var dmgB = a.atk - b.def;
   if ( dmgB <= 0 ) dmgB = 1;

   a.hp -= dmgA;
   b.hp -= dmgB;

   if ( a.hp <= 0 ) return 1;
   else if ( b.hp <= 0 ) return 2;
   else return 0;
}

// Hybridates two monsters
// Monster a becomes a new monster with mixed parts and statistics
var hybridate = function ( a, b, wa, wb ) {
   // Get one new part at random
   var whichPart = Math.floor ( Math.random() * 6 );
   if ( whichPart == 0 ) a.color = b.color;
   if ( whichPart == 1 ) a.eyes = b.eyes;
   if ( whichPart == 2 ) a.nose = b.nose;
   if ( whichPart == 3 ) a.mouth = b.mouth;
   if ( whichPart == 4 ) a.ears = b.ears;
   if ( whichPart == 5 ) a.extra = b.extra;

   a.atk = Math.ceil((wa*a.atk + wb*b.atk) / (wa+wb));
   a.def = Math.ceil((wa*a.def + wb*b.def) / (wa+wb));
   a.reg = Math.ceil((wa*a.reg + wb*b.reg) / (wa+wb));

   var oldHP = a.hp / a.maxHP;
   a.maxHP = Math.ceil((wa*a.maxHP + wb*b.maxHP) / (wa+wb));
   a.hp = Math.ceil ( oldHP * a.maxHP );
}

// Breakout brick class
var BreakoutBrick = function ( ) {
   // Color
   this.color = 0;

   // Level
   // Determines both the appearance of the brick and the amount of hits it can take
   // Levels 0,1,2,3 are breakable, level 4 is indestructible
   this.level = 0;

   // Brick dimensions [pixels], format [x,y,w,h]
   this.p = [ 0, 0, brickWidth, brickHeight ];

   // Draw the brick
   this.draw = function ( ctxt ) {
      ctxt.drawImage ( imgBricks, this.color * this.p[2], this.level * this.p[3], this.p[2], this.p[3],
                       this.p[0], this.p[1], this.p[2], this.p[3] );
   }
}

// Breakout paddle class
var BreakoutPaddle = function ( ) {
   this.x = 0; // Position of the paddle [pixels]
   this.v = 0; // Velocity of the paddle [pixels/s]
   this.w = 96; // Width of the paddle [pixels]

   // Paddle direction flag
   // -1: moving left, 0: not moving, 1: moving right
   this.dir = 0;

   // Paddle color
   this.color = 1;

   // Draw the paddle
   this.draw = function ( ctxt, y ) {
      // Paddle begin
      ctxt.drawImage ( imgPaddle, 0, this.color * paddleHeight, 21, paddleHeight,
                       this.x - this.w / 2, y, 21, paddleHeight );

      // Paddle mid part
      for ( var ww = 21 ; ww < this.w - 21; ww += 3 )
         ctxt.drawImage ( imgPaddle, 21, this.color * paddleHeight, 3, paddleHeight,
                          this.x - this.w / 2 + ww, y, 3, paddleHeight );

      // Paddle end
      ctxt.drawImage ( imgPaddle, 51, this.color * paddleHeight, 21, paddleHeight,
                       this.x + this.w / 2 - 21, y, 21, paddleHeight );
   }

   // Update the paddle
   this.update = function ( t ) {
   }
}

// Breakout class
var Breakout = function ( ) {
   // Position of the paddles of the two players
   this.paddles = [ new BreakoutPaddle(), new BreakoutPaddle() ];

   // Bricks
   this.bricks = [];

   // Balls
   this.balls = [];

   // Field size
   this.width = 747;
   this.height = 576;

   // Breakout setup
   this.setup = function ( ) {
      this.width = cnvs.width;
      this.height = cnvs.height;
      this.randomize();
   }

   // Generate random field
   this.randomize = function ( ) {
      this.bricks = [];

      var cols = cnvs.width / brickWidth;
      var rows = cnvs.height / brickHeight;

      console.log ( "GENERATING BREAKOUT FIELD, " + cols + " columns, " + rows + " rows" );

      for ( var i = 0; i < 8; ++i ) {
         var duplicate = 1;
         var col = 0, row = 0;
         while ( duplicate ) {
            row = Math.floor ( Math.random() * (rows / 2 - 4) );

            var maxCol = cols / 2 - (row % 2 == 0);
            col = Math.floor ( Math.random() * maxCol );

            duplicate = 0;
            for ( var j = 0; j < this.bricks.length; ++j ) {
               if ( this.bricks[j].p[0] == col && this.bricks[j].p[1] == row ) {
                  duplicate = 1;
                  break;
               }
            }
         }

         var color = Math.floor ( Math.random() * colorNumber );
         var level = Math.floor ( Math.random() * 5 );
         if ( level == 4 ) color = 0;

         var b1 = new BreakoutBrick();
         b1.p[0] = col;
         b1.p[1] = row;
         b1.color = color; b1.level = level;
         this.bricks.push ( b1 );

         var b4 = new BreakoutBrick();
         b4.p[0] = col;
         b4.p[1] = (-row);
         b4.color = color; b4.level = level;
         this.bricks.push ( b4 );

         if ( row % 2 != 0 || col != 0 ) {
            var b2 = new BreakoutBrick();
            b2.p[0] = row % 2 == 0 ? -col : -1-col;
            b2.p[1] = row;
            b2.color = color; b2.level = level;
            this.bricks.push ( b2 );

            var b3 = new BreakoutBrick();
            b3.p[0] = row % 2 == 0 ? -col : -1-col;
            b3.p[1] = (-row);
            b3.color = color; b3.level = level;
            this.bricks.push ( b3 );
         }
      }

      for ( var i = 0; i < this.bricks.length; ++i ) {
         this.bricks[i].p[0] *= brickWidth;
         if ( this.bricks[i].p[1] % 2 == 0 ) this.bricks[i].p[0] -= brickWidth / 2;

         this.bricks[i].p[1] *= brickHeight;
      }
   }

   // Breakout draw
   this.draw = function ( ctxt ) {
      // Draw the bricks
      for ( var i = 0; i < this.bricks.length; ++i )
         this.bricks[i].draw ( ctxt );

      // Draw the paddles
      this.paddles[0].draw ( ctxt, cnvs.height / 2 - brickHeight - paddleHeight - 3 );
      this.paddles[1].draw ( ctxt, -cnvs.height / 2 + brickHeight + 3 );
   }

   // Breakout update
   this.update = function ( t ) {
   }
}

// Game class
var Game = function ( ) {
   // Game state
   // 0 = game not setup
   // 1 = breakout phase
   // 2 = loot phase
   // 3 = game over
   this.state = 0;

   // Breakout game object
   this.breakout = new Breakout();

   // Game setup function
   this.setup = function ( ) {
      this.breakout.setup();
      this.state = 1;
   }

   // Draw game function
   this.draw = function ( ctxt ) {
      if ( this.state == 1 ) {
         this.breakout.draw ( ctxt );
      }
   }

   // Update game function
   this.update = function ( t ) { }
}

// Flow handling ///////////////////////////////////////////////////////////////

var cnvs = 0; // Canvas reference
var ctxt = 0; // 2D context of cnvs

var g = new Game();

// Setup function
// Called on page load; sets up DOM variables and callbacks
var setup = function ( ) {
   // Retrieve canvas and canvas context
   cnvs = document.getElementById( "canvas" );
   ctxt = cnvs.getContext ( "2d" );

   // Preload images
   loadImages();

   // Setup bitmap font
   font = new BitFont ( "./gfx/font.png", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?.,;:/", 15, 24 );
   font.colorLineHeight = 27;
   font.charW [ font.ch("I") ] = 6;
   font.charW [ font.ch("J") ] = 12;
   font.charW [ font.ch("M") ] = 18;
   font.charW [ font.ch("T") ] = 12;
   font.charW [ font.ch("W") ] = 18;
   font.charW [ font.ch("i") ] = 6;
   font.charW [ font.ch("j") ] = 9;
   font.charW [ font.ch("l") ] = 6;
   font.charW [ font.ch("m") ] = 18;
   font.charW [ font.ch("w") ] = 18;
   font.charW [ font.ch("1") ] = 9;
   font.charW [ font.ch("!") ] = 6;
   font.charW [ font.ch("/") ] = 12;
   font.charH [ font.ch("g") ] = font.charH [ font.ch("j") ] = font.charH [ font.ch("p") ] = font.charH [ font.ch("q") ] = font.charH [ font.ch("y") ] = 30;
   font.charW [ font.ch(".") ] = font.charW [ font.ch(",") ] = font.charW [ font.ch(";") ] = font.charW [ font.ch(":") ] = 6;
   font.charH [ font.ch(",") ] = font.charH [ font.ch(";") ] = 27;
   font.baselineSkip = 27;
   font.finalize ();

   // Add functions to context
   ctxt.text = function ( x, y, text, col ) { font.renderText ( this, x, y, text, col ); }
   ctxt.hline = function ( x1, x2, y ) {
      var a = Math.round ( Math.min(x1,x2)/3 ) * 3;
      var b = Math.round ( Math.max(x1,x2)/3 ) * 3;
      this.fillRect ( a, Math.round ( y/3 ) * 3, b-a, 3 );
   }
   ctxt.vline = function ( x, y1, y2 ) {
      var a = Math.round ( Math.min(y1,y2)/3 ) * 3;
      var b = Math.round ( Math.max(y1,y2)/3 ) * 3;
      this.fillRect ( Math.round ( x/3 ) * 3, a, 3, b-a );
   }

   // Keyboard callbacks
   document.onkeydown = function ( e ) {
   }

   // Setup game
   g.setup();

   requestAnimationFrame ( draw );
}

// Drawing function
var draw = function () {
   requestAnimationFrame ( draw );

   ctxt.fillStyle = "black";
   ctxt.fillRect ( 0, 0, cnvs.width, cnvs.height );

   ctxt.save(); ctxt.translate ( cnvs.width/2, cnvs.height/2 );
   g.draw ( ctxt );
   ctxt.restore();
}
