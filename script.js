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

// Game class
var Game = function ( ) {
   // Game state
   // 0 = not yet begun
   // 1 = waiting for player action
   this.state = 0;

   // Player monster
   this.player = new Monster();

   // Cards
   this.cards = [ 0, 0, 0 ];

   // Selected card
   this.selected = 1;

   // Killed monsters counter
   this.killed = 0;

   // Logics ///////////////////////////////////////////////////////////////////

   // Setup the game
   this.setup = function ( ) {
      this.player.randomizeParts();
      this.player.randomizeStats(20,5);
      this.randomCard ( 0 );
      this.randomCard ( 1 );
      this.randomCard ( 2 );
   }

   // Randomly generates a card
   this.randomCard = function ( i ) {
      this.cards[i] = {
         type: "monster",
         info: function() { return this.monster.info(); },
         monster: new Monster()
      };
      this.cards[i].monster.randomizeParts();
      this.cards[i].monster.randomizeStats(10, 5+2*this.killed);
   }

   // Action on card (fight monster)
   this.action = function ( target ) {
      if ( this.cards[target] == 0 ) return;
      if ( this.cards[target].type == "monster" ) {
         var outcome = fight ( this.player, this.cards[target].monster );

         if ( outcome == 1 ) { // Player loses, GAME OVER!
            console.log ( "GAME OVER (not really though... not implemented yet)" );
            // TODO
         }

         else if ( outcome == 2 ) {
            this.killed++;
            hybridate ( this.player, this.cards[target].monster, 0.8, 0.2 );
            this.randomCard ( target );
         }
      }

      // Regeneration
      this.player.hp = Math.min ( this.player.hp + this.player.reg, this.player.maxHP );
      for ( var i = 0; i < 3; ++i )
         if ( this.cards[i] != 0 && this.cards[i].type == "monster" )
            this.cards[i].monster.hp = Math.min ( this.cards[i].monster.hp + this.cards[i].monster.reg, this.cards[i].monster.maxHP );
   }

   // Graphics /////////////////////////////////////////////////////////////////

   this.draw = function ( ctxt ) {
      var H = ctxt.canvas.height;
      var W = ctxt.canvas.width;

      // Draw the player
      ctxt.drawImage ( imgFrame, 15, H - frameHeight - 15 );
      this.player.draw ( ctxt, 15, H - frameHeight - 15 );
      hpBar ( ctxt, 36, H - 27, frameWidth - 42, this.player.hp / this.player.maxHP );

      // Player info
      ctxt.fillStyle = "white";
      ctxt.text ( 30 + frameWidth, H - frameHeight - 15, this.player.info() + "\n\nkilled: " + this.killed, 0 );
      ctxt.vline ( W/2, H - frameHeight - 12, H - 18 );

      // Draw the option cards
      for ( var i = 0; i < 3; ++i ) {
         if ( this.cards[i] == 0 ) continue;

         var x = Math.floor(((W - 3*frameWidth - 2*45)/2)/3)*3 + i * (frameWidth + 45);
         var y = 60;

         if ( this.selected == i )
            ctxt.drawImage ( imgFrameSelected, x + selFrameDX, y + selFrameDY );
         else
            ctxt.drawImage ( imgFrame, x, y );

         if ( this.cards[i].type == "monster" ) { // Monster card: draw the monster
            this.cards[i].monster.draw ( ctxt, x, y );
            hpBar ( ctxt, x + 21, y + frameHeight - 12, frameWidth - 42, this.cards[i].monster.hp / this.cards[i].monster.maxHP );
         }
      }

      // Info about the selected card
      if ( this.cards[this.selected].type == "monster" ) {
         var y = H - frameHeight - 15;
         var m = this.cards[this.selected].monster;
         var col = function ( a, b ) { if ( a < b ) return 1; if ( a == b ) return 0; if ( a > b ) return 4; }

         ctxt.text ( W/2 + 15, y, m.name, 0 ); y += 2*font.baselineSkip;
         ctxt.text ( W/2 + 15, y, "hp: " + m.hp + "/" + m.maxHP, col ( m.maxHP, this.player.maxHP ) ); y += font.baselineSkip;
         ctxt.text ( W/2 + 15, y, "atk: " + m.atk, col ( m.atk, this.player.atk ) ); y += font.baselineSkip;
         ctxt.text ( W/2 + 15, y, "def: " + m.def, col ( m.def, this.player.def ) ); y += font.baselineSkip;
         ctxt.text ( W/2 + 15, y, "reg: " + m.reg, col ( m.reg, this.player.reg ) ); y += 2*font.baselineSkip;

         ctxt.text ( W/2 + 15, y, "dmg give: " + Math.max(this.player.atk - m.def,1) + " dmg take: " + Math.max(m.atk - this.player.def,1), 0 );
      }
   }
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
      if ( e.key == "ArrowLeft" ) { // Left key
         g.selected = (g.selected - 1);
         if ( g.selected < 0 ) g.selected = 2;
      }
      else if ( e.key == "ArrowRight" ) { // Right key
         g.selected = (g.selected + 1) % 3;
      }
      else if ( e.key == " " ) { // Space: action
         g.action ( g.selected );
      }
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

   g.draw ( ctxt );
}
