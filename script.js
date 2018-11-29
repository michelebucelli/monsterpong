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
const ballSize = 18;

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

const paddleAccel = 4000; // Paddle acceleration [pixels/s^2]
const paddleDamp = 3; // Paddle damping factor [1/s]
const ballSpeed = 300; // Ball speed [pixels/second]

var names = new RandName ( [ [ "Green ", "Blue ", "Red " ], // Color
                             [ "S", "R", "T", "W", "M" ], // Eyes
                             [ "ao", "oo", "oi", "e" ], // Nose
                             [ "ck", "t", "r", "n", "v" ], // Mouth,
                             [ "i", "ar", "eb" ], // Ears
                             [ "bull", "hog", "ler" ] ] ); // Extra

// Monster part class
var MonsterPart = function ( ) {
   this.id = 0; // Part index (matches image)

   // Part stats: [atk, def, hp]
   this.stats = [0,0,0];
}

// Parts archive
var partsExtra = [ // Extras
   { id: 0, stats: [1,0,1] }, // Big horns
   { id: 1, stats: [1,0,1] }, // Small horns
   { id: 2, stats: [0,1,2] }  // Flurry hair
];
var partsEyes = [ // Eyes
   { id: 0, stats: [1,0,2] }, // Big angry eye
   { id: 1, stats: [0,0,2] }, // Three dark eyes
   { id: 2, stats: [0,0,3] }, // Green scared eyes
   { id: 3, stats: [1,0,1] }, // Three bright eyes
   { id: 4, stats: [0,1,2] }  // Big cute eye
];
var partsMouths = [ // Mouths
   { id: 0, stats: [0,1,2] }, // Bear mouth
   { id: 1, stats: [0,0,2] }, // Straight mouth
   { id: 2, stats: [0,1,1] }, // Round hole mouth
   { id: 3, stats: [1,0,1] }, // Open mouth with teeth
   { id: 4, stats: [1,0,0] }  // Closed mouth with teeth
];
var partsNoses = [ // Noses
   { id: 0, stats: [0,0,2] }, // Square nose
   { id: 1, stats: [0,0,4] }, // Round nose
   { id: 2, stats: [1,1,0] }, // Monkey nose
   { id: 3, stats: [0,0,2] }  // Weird nose
];
var partsEars = [ // Ears
   { id: 0, stats: [0,1,2] },
   { id: 1, stats: [0,0,2] },
   { id: 2, stats: [1,1,0] }
];

// Monster class
var Monster = function ( ) {
   // Misc info ////////////////////////////////////////////////////////////////
   this.name = "";

   // Graphics /////////////////////////////////////////////////////////////////
   this.color = 0;

   // Parts composing the monster
   // [ extra, eyes, mouths, noses, ears ]
   this.parts = [ partsExtra[0], partsEyes[0], partsMouths[0], partsNoses[0], partsEars[0] ];

   // Draws the monster
   //    ctxt: context to draw on
   //    x,y: coordinates for the upper-left corner of the frame
   this.draw = function ( ctxt, x, y ) {
      ctxt.drawImage ( imgBody, this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Body
      ctxt.drawImage ( imgExtra[this.parts[0].id], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Extra
      ctxt.drawImage ( imgEyes[this.parts[1].id], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Eyes
      ctxt.drawImage ( imgMouth[this.parts[2].id], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Mouth
      ctxt.drawImage ( imgNose[this.parts[3].id], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Nose
      ctxt.drawImage ( imgEars[this.parts[4].id], this.color * frameWidth, 0, frameWidth, frameHeight, x, y, frameWidth, frameHeight ); // Ears
   }

   // Statistics ///////////////////////////////////////////////////////////////
   this.hp = 0; // Current health value

   // Compute value of stat
   this.stat = function ( idx ) {
      var result = 0;
      for ( var i = 0; i < this.parts.length; ++i )
         result += this.parts[i].stats[idx];
      return result;
   }

   // Miscellaneous ////////////////////////////////////////////////////////////

   // Randomly assigns values to the monster parts
   this.randomizeParts = function ( ) {
      this.color = Math.floor ( Math.random() * colorNumber );
      this.parts = [ partsExtra [ Math.floor ( Math.random() * extraNumber ) ],
                     partsEyes [ Math.floor ( Math.random() * eyesNumber ) ],
                     partsMouths [ Math.floor ( Math.random() * mouthsNumber ) ],
                     partsNoses [ Math.floor ( Math.random() * nosesNumber ) ],
                     partsEars [ Math.floor ( Math.random() * earsNumber ) ],
                  ];

      this.name = names.get ( [ this.color, this.parts[0].id, this.parts[1].id, this.parts[2].id, this.parts[3].id, this.parts[4].id ] );

      this.hp = this.stat ( 2 );
   }

   // Monster info text
   this.info = function ( ) {
      return this.name;
   }
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

   // Brick was hit flag
   this.hit = 0;

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
   this.w = 42*3; // Width of the paddle [pixels]

   // Paddle direction flag
   // -1: moving left, 0: not moving, 1: moving right
   this.dir = 0;

   // Paddle color
   this.color = 1;

   // Draw the paddle
   this.draw = function ( ctxt, y ) {
      var x0 = this.x - this.w / 2;
      x0 = Math.floor ( x0 / 3 ) * 3;

      // Paddle begin
      ctxt.drawImage ( imgPaddle, 0, this.color * paddleHeight, 21, paddleHeight,
                       x0, y, 21, paddleHeight );

      // Paddle mid part
      for ( var ww = 21 ; ww < this.w - 21; ww += 3 )
         ctxt.drawImage ( imgPaddle, 21, this.color * paddleHeight, 3, paddleHeight,
                          x0 + ww, y, 3, paddleHeight );

      // Paddle end
      ctxt.drawImage ( imgPaddle, 51, this.color * paddleHeight, 21, paddleHeight,
                       x0 + this.w - 21, y, 21, paddleHeight );
   }

   // Update the paddle
   this.update = function ( t ) {
      var a = paddleAccel * this.dir - paddleDamp * this.v;
      this.x += this.v * t + 0.5 * a * t * t;
      this.v += a * t;
   }
}

// Breakout ball
var BreakoutBall = function ( ) {
   this.x = [ 0, 0 ]; // Ball position
   this.v = [ 0, 0 ]; // Ball velocity

   // To which player the ball is bound (if any)
   // 0 = no player, 1 = player 1, 2 = player 2
   this.bound = 0;

   // Update the ball
   this.update = function ( t ) {
      for ( var i = 0; i < 2; ++i )
         this.x[i] += this.v[i] * t;
   }

   // Draw the ball
   this.draw = function ( ctxt ) {
      ctxt.drawImage ( imgBall, this.x[0], this.x[1] );
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

   // Game time
   this.t = 0;

   // Players
   this.p1 = 0;
   this.p2 = 0;

   // Breakout setup
   this.setup = function ( p1, p2 ) {
      this.p1 = p1;
      this.p2 = p2;

      this.width = cnvs.width;
      this.height = cnvs.height;

      this.randomize();

      var atk1 = p1.stat(0);
      for ( var i = 0; i < Math.max(atk1,1); ++i )
         this.spawnBall(1);

      var atk2 = p2.stat(0);
      for ( var j = 0; j < Math.max(atk2,1); ++j )
         this.spawnBall(2);

      this.setupDefenses();

      this.paddles[0].color = p1.color;
      this.paddles[1].color = p2.color;
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

         var b1 = new BreakoutBrick();
         b1.p[0] = col;
         b1.p[1] = row;
         b1.color = color; b1.level = level;
         this.bricks.push ( b1 );

         if ( row != 0 ) {
            var b4 = new BreakoutBrick();
            b4.p[0] = col;
            b4.p[1] = (-row);
            b4.color = color; b4.level = level;
            this.bricks.push ( b4 );
         }

         if ( row % 2 != 0 || col != 0 ) {
            var b2 = new BreakoutBrick();
            b2.p[0] = row % 2 == 0 ? -col : -1-col;
            b2.p[1] = row;
            b2.color = color; b2.level = level;
            this.bricks.push ( b2 );

            if ( row != 0 ) {
               var b3 = new BreakoutBrick();
               b3.p[0] = row % 2 == 0 ? -col : -1-col;
               b3.p[1] = (-row);
               b3.color = color; b3.level = level;
               this.bricks.push ( b3 );
            }
         }
      }

      for ( var i = 0; i < this.bricks.length; ++i ) {
         this.bricks[i].p[0] *= brickWidth;
         if ( this.bricks[i].p[1] % 2 == 0 ) this.bricks[i].p[0] -= brickWidth / 2;

         this.bricks[i].p[1] *= brickHeight;
         this.bricks[i].p[1] -= brickHeight / 2;
      }
   }

   // Setup defenses
   this.setupDefenses = function ( ) {
      var cols = cnvs.width / brickWidth;

      for ( var i = 0; i < 2*cols; ++i ) {
         // P1 defenses
         var b1 = new BreakoutBrick();
         b1.color = this.p1.color;
         b1.level = Math.min ( this.p1.stat(1), 3 );
         b1.p[0] = i * brickWidth - this.width;
         b1.p[1] = this.height / 2 - brickHeight;
         this.bricks.push ( b1 );

         // P2 defenses
         var b2 = new BreakoutBrick();
         b2.color = this.p2.color;
         b2.level = Math.min ( this.p2.stat(1), 3 );
         b2.p[0] = i * brickWidth - this.width;
         b2.p[1] = -this.height / 2;
         this.bricks.push ( b2 );
      }
   }

   // Breakout draw
   this.draw = function ( ctxt ) {
      // Draw the bricks
      for ( var i = 0; i < this.bricks.length; ++i )
         this.bricks[i].draw ( ctxt );

      // Draw the paddles
      this.paddles[0].draw ( ctxt, this.height / 2 - brickHeight - paddleHeight - 3 );
      this.paddles[1].draw ( ctxt, -this.height / 2 + brickHeight + 3 );

      // Draw the balls
      for ( var i = 0; i < this.balls.length; ++i )
         this.balls[i].draw ( ctxt );
   }

   // Breakout update
   this.update = function ( t ) {
      // Moves enemy with AI, player according to keys
      this.ai();
      var l = key("left"), r = key("right"), s = key("shoot");
      if ( l && !r ) this.paddles[0].dir = -1;
      if ( r && !l ) this.paddles[0].dir =  1;
      if ( (!l && !r) || (r && l) ) this.paddles[0].dir = 0;
      if ( s ) this.shoot ( 1 );

      // Update the paddles
      for ( var i = 0; i < 2; ++i ) {
         this.paddles[i].update ( t );

         if ( Math.abs(this.paddles[i].x) > (this.width - this.paddles[i].w) / 2 ) {
            this.paddles[i].x = Math.sign(this.paddles[i].x) * (this.width - this.paddles[i].w) / 2;
            this.paddles[i].v *= -0.1;
         }
      }

      // Update the balls
      for ( var i = 0; i < this.balls.length; ++i ) {
         if ( this.balls[i].bound > 0 ) {
            // Count the balls bound to the player
            var howManyBound = 0;
            var howManyBoundBefore = 0;
            for ( var j = 0; j < this.balls.length; ++j ) {
               howManyBound += (this.balls[j].bound == this.balls[i].bound);
               howManyBoundBefore += (j < i && this.balls[j].bound == this.balls[i].bound);
            }

            var targetX = this.paddles[this.balls[i].bound - 1].x - howManyBound * ballSize / 2 + howManyBoundBefore * ballSize + ballSize / 2;

            this.balls[i].x[1] = this.balls[i].bound == 1 ? (this.height / 2 - brickHeight - paddleHeight - 3 - ballSize) : (- this.height / 2 + brickHeight + 3 + paddleHeight) ;
            this.balls[i].v[0] = (targetX - this.balls[i].x[0] - ballSize / 2) * 15;
         }

         this.balls[i].update ( t );
      }

      // Check collisions
      this.collisions ();

      // Checks for hit bricks
      for ( var i = 0; i < this.bricks.length; ++i ) {
         if ( this.bricks[i].hit && this.bricks[i].level < 4 ) {
            this.bricks[i].level--;
            this.bricks[i].hit = 0;
            if ( this.bricks[i].level < 0 ) {
               this.bricks.splice ( i, 1 );
               i--;
            }
         }
      }

      this.t += t;
   }

   // Collision checks and resolution
   this.collisions = function () {
      for ( var i = 0; i < this.balls.length; ++i ) {
         var b = this.balls[i];

         // Ball against right wall
         if ( b.x[0] + ballSize > this.width/2 ) {
            b.x[0] = this.width/2 - ballSize;
            b.v[0] *= -1;
         }

         // Ball against left wall
         if ( b.x[0] < -this.width/2 ) {
            b.x[0] = -this.width/2;
            b.v[0] *= -1;
         }

         // Ball out, player 2
         if ( b.x[1] + ballSize < -this.height / 2 ) {
            // ... player 2 takes damage

            this.balls.splice ( i, 1 ); // Remove the ball
            console.log ( "OUT, ball " + i + " lost by player 2" );
            continue;
         }

         // Ball out, player 1
         if ( b.x[1] > this.height / 2 ) {
            // ... player 1 takes damage

            this.balls.splice ( i, 1 ); // Remove the ball
            console.log ( "OUT, ball " + i + " lost by player 1" );
            continue;
         }

         // Ball against paddles: paddle player 1
         if ( b.v[1] > 0 && b.x[1] + ballSize > this.height / 2 - brickHeight - paddleHeight - 3
            && b.x[1] < this.height / 2 - brickHeight - 3
            && Math.abs ( b.x[0] + ballSize/2 - this.paddles[0].x ) < ( this.paddles[0].w + ballSize ) / 2 ) {

            b.v[0] = 0.5 * ( b.v[0] + this.paddles[0].v );
            if ( Math.abs(b.v[0]) >= 0.9 * ballSpeed )
               b.v[0] = 0.9 * ballSpeed * Math.sign(b.v[0]);

            b.v[1] = Math.sqrt ( ballSpeed*ballSpeed - b.v[0]*b.v[0] ) * -1;
         }

         // Ball against paddles: paddle player 2
         if ( b.v[1] < 0 && b.x[1] < -this.height / 2 + brickHeight + 3 + paddleHeight
            && b.x[1] > -this.height / 2 + brickHeight + 3
            && Math.abs ( b.x[0] + ballSize/2 - this.paddles[1].x ) < ( this.paddles[1].w + ballSize ) / 2 ) {

            b.v[0] = 0.5 * ( b.v[0] + this.paddles[1].v );
            if ( Math.abs(b.v[0]) >= 0.9 * ballSpeed )
               b.v[0] = 0.9 * ballSpeed * Math.sign(b.v[0]);

            b.v[1] = Math.sqrt ( ballSpeed*ballSpeed - b.v[0]*b.v[0] );
         }

         // Ball against bricks
         for ( var j = 0; j < this.bricks.length; ++j ) {
            var k = this.bricks[j];

            // Brick left side
            if ( b.v[0] > 0 && b.x[0] + ballSize > k.p[0] && b.x[0] < k.p[0] && Math.abs(k.p[1] + k.p[3]/2 - b.x[1] - ballSize/2) < (ballSize + k.p[3])/2 ) {
               b.x[0] = k.p[0] - ballSize;
               k.hit = 1;
               b.v[0] *= -1;
            }

            // Brick right side
            if ( b.v[0] < 0 && b.x[0] < k.p[0] + k.p[2] && b.x[0] + ballSize > k.p[0] + k.p[2] && Math.abs(k.p[1] + k.p[3]/2 - b.x[1] - ballSize/2) < (ballSize + k.p[3])/2 ) {
               b.x[0] = k.p[0] + k.p[2];
               k.hit = 1;
               b.v[0] *= -1;
            }

            // Brick top side
            if ( b.v[1] > 0 && b.x[1] + ballSize > k.p[1] && b.x[1] < k.p[1] && Math.abs(k.p[0] + k.p[2]/2 - b.x[0] - ballSize/2) < (ballSize + k.p[2])/2 ) {
               b.x[1] = k.p[1] - ballSize;
               k.hit = 1;
               b.v[1] *= -1;
            }

            // Brick bottom side
            if ( b.v[1] < 0 && b.x[1] < k.p[1] + k.p[3] - 3 && b.x[1] + ballSize > k.p[1] + k.p[3] && Math.abs(k.p[0] + k.p[2]/2 - b.x[0] - ballSize/2) < (ballSize + k.p[2])/2 ) {
               b.x[1] = k.p[1] + k.p[3];
               k.hit = 1;
               b.v[1] *= -1;
            }
         }
      }
   }

   // Spawn a ball for one of the two player
   this.spawnBall = function ( player ) {
      var ball = new BreakoutBall();
      ball.bound = player;
      this.balls.push(ball);
   }

   // Shoot!
   this.shoot = function ( player ) {
      for ( var i = 0; i < this.balls.length; ++i ) {
         if ( this.balls[i].bound == player ) {
            this.balls[i].bound = 0;
            this.balls[i].v[0] = this.paddles[player-1].v;

            // Random variation to the ball speed
            if ( Math.abs(this.balls[i].v[0]) >= 0.75 * ballSpeed )
               this.balls[i].v[0] = 0.75 * ballSpeed * Math.sign(this.balls[i].v[0]);

            this.balls[i].v[0] += (Math.random() - 0.5) * 100;

            this.balls[i].v[1] = Math.sqrt ( ballSpeed*ballSpeed - this.balls[i].v[0]*this.balls[i].v[0] ) * ( player == 1 ? -1 : 1 );
         }
      }
   }

   // AI
   // Controls player 2
   this.ai = function ( ) {
      // No balls = nothing to be done
      if ( this.balls.length <= 0 ) return;

      var nearestIncomingBall = this.balls[0];
      var nearestBall = this.balls[0];

      // Checks if there are balls attached and finds the nearest incoming ball
      for ( var i = 0; i < this.balls.length; ++i ) {
         if ( this.balls[i].v[1] < 0 && this.balls[i].x[1] < nearestIncomingBall.x[1] )
            nearestIncomingBall = this.balls[i];
         if ( this.balls[i].x[1] < nearestBall.x[1] )
            nearestBall = this.balls[i];

         if ( this.balls[i].bound == 2 && this.t >= 2 )
            this.shoot ( 2 );
      }

      // Moves according to nearest incoming ball
      // If no ball is incoming, moves according to the nearest
      var targetBall = (nearestIncomingBall.v[1] < 0 ? nearestIncomingBall : nearestBall);
      var delta = targetBall.x[0] + ballSize / 2 - this.paddles[1].x;

      if ( Math.abs(delta) > this.paddles[1].w / 2 )
         this.paddles[1].dir = Math.sign ( delta );

      // If the target ball is very close and incoming, move a little at random to give effect
      else if ( targetBall.x[1] - (-this.height/2 + brickHeight + 3 + paddleHeight) < 30 && targetBall.v[1] < 0 ) {
         if ( this.paddles[1].dir == 0 ) {
            console.log ( "EFFECT!" );
            this.paddles[1].dir = ( Math.random() > 0.5 ? -1 : 1 );
         }
      }

      else this.paddles[1].dir = 0;
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

   // Player object and current opponent
   this.player = 0;
   this.enemy = 0;

   // Game setup function
   this.setup = function ( ) {
      this.player = new Monster();
      this.player.randomizeParts();

      this.randomEnemy();

      this.breakout.setup( this.player, this.enemy );
      this.state = 1;
   }

   // Creates a new enemy at random
   this.randomEnemy = function ( ) {
      this.enemy = new Monster();
      this.enemy.randomizeParts();
   }

   // Draw game function
   this.draw = function ( ctxt, p1Ctxt, p2Ctxt ) {
      if ( this.state == 1 ) {
         this.breakout.draw ( ctxt );
      }

      var s = this.player.name;
      p1Ctxt.text ( p1Cnvs.width - font.textWidth(s) - 12, p1Cnvs.height - 6 - font.baselineSkip, s, 0 );
      this.player.draw ( p1Ctxt, p1Cnvs.width - frameWidth - 12, p1Cnvs.height - frameHeight - font.baselineSkip - 6 );

      s = this.enemy.name;
      p2Ctxt.text ( 12, 12, s, 0 );
      this.enemy.draw ( p2Ctxt, 12, font.baselineSkip + 6 );
   }

   // Update game function
   this.update = function ( t ) {
      if ( this.state == 1 ) {
         this.breakout.update ( t );
      }
   }
}

// Flow handling ///////////////////////////////////////////////////////////////

var cnvs = 0; // Canvas reference
var ctxt = 0; // 2D context of cnvs

var p1Cnvs = 0; // Player 1 canvas reference
var p1Ctxt = 0; // 2D context of p1Cnvs

var p2Cnvs = 0; // Player 2 canvas reference
var p2Ctxt = 0; // 2D context of p1Cnvs

var g = new Game();

// Setup function
// Called on page load; sets up DOM variables and callbacks
var setup = function ( ) {
   // Retrieve canvas and canvas context
   cnvs = document.getElementById( "mainCanvas" );
   ctxt = cnvs.getContext ( "2d" );
   p1Cnvs = document.getElementById( "p1Canvas" );
   p1Ctxt = p1Cnvs.getContext ( "2d" );
   p2Cnvs = document.getElementById( "p2Canvas" );
   p2Ctxt = p2Cnvs.getContext ( "2d" );

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
   p1Ctxt.text = p2Ctxt.text = ctxt.text = function ( x, y, text, col ) { font.renderText ( this, x, y, text, col ); }
   p1Ctxt.hline = p2Ctxt.hline = ctxt.hline = function ( x1, x2, y ) {
      var a = Math.round ( Math.min(x1,x2)/3 ) * 3;
      var b = Math.round ( Math.max(x1,x2)/3 ) * 3;
      this.fillRect ( a, Math.round ( y/3 ) * 3, b-a, 3 );
   }
   p1Ctxt.vline = p2Ctxt.vline = ctxt.vline = function ( x, y1, y2 ) {
      var a = Math.round ( Math.min(y1,y2)/3 ) * 3;
      var b = Math.round ( Math.max(y1,y2)/3 ) * 3;
      this.fillRect ( Math.round ( x/3 ) * 3, a, 3, b-a );
   }

   // Register keys
   registerKey ( "left", "ArrowLeft" );
   registerKey ( "right", "ArrowRight" );
   registerKey ( "shoot", " " );
   setupKeys();

   // Setup game
   g.setup();

   lastUpdateTime = Date.now();
   requestAnimationFrame ( update );
   requestAnimationFrame ( draw );
}

// Drawing function
var draw = function () {
   requestAnimationFrame ( draw );

   ctxt.fillStyle = "black";
   ctxt.fillRect ( 0, 0, cnvs.width, cnvs.height );

   ctxt.save(); ctxt.translate ( cnvs.width/2, cnvs.height/2 );
   g.draw ( ctxt, p1Ctxt, p2Ctxt );
   ctxt.restore();
}

// Update function
var lastUpdateTime = 0;
var update = function () {
   requestAnimationFrame ( update );

   var deltat = Date.now() - lastUpdateTime;
   g.update ( deltat / 1000 );

   lastUpdateTime = Date.now();
}
