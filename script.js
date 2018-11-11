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

// Images to be loaded
var imgFrame = 0;
var imgBody = 0;
var imgEyes = 0;
var imgNose = 0;
var imgMouth = 0;
var imgEars = 0;
var imgExtra = 0;

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
   imgBody = new Image(); imgBody.src = "./gfx/body.png";
   imgEyes = loadImagesArray ( "./gfx/eyes", eyesNumber );
   imgNose = loadImagesArray ( "./gfx/noses", nosesNumber );
   imgMouth = loadImagesArray ( "./gfx/mouths", mouthsNumber );
   imgEars = loadImagesArray ( "./gfx/ears", earsNumber );
   imgExtra = loadImagesArray ( "./gfx/extra", extraNumber );
}

// Game logic //////////////////////////////////////////////////////////////////

// Monster class
var Monster = function ( ) {
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

   // Miscellaneous ////////////////////////////////////////////////////////////

   // Randomly assigns values to the monster parts
   this.randomize = function ( ) {
      this.color = Math.floor ( Math.random() * colorNumber );
      this.eyes = Math.floor ( Math.random() * eyesNumber );
      this.nose = Math.floor ( Math.random() * nosesNumber );
      this.mouth = Math.floor ( Math.random() * mouthsNumber );
      this.ears = Math.floor ( Math.random() * earsNumber );
      this.extra = Math.floor ( Math.random() * extraNumber );
   }
}

// Flow handling ///////////////////////////////////////////////////////////////

var cnvs = 0; // Canvas reference
var ctxt = 0; // 2D context of cnvs

// Setup function
// Called on page load; sets up DOM variables and callbacks
var setup = function ( ) {
   // Retrieve canvas and canvas context
   cnvs = document.getElementById( "canvas" );
   ctxt = cnvs.getContext ( "2d" );

   // Preload images
   loadImages();

   // Setup bitmap font
   font = new BitFont ( "./gfx/font.png", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?.,;:", 15, 24 );
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
   font.charH [ font.ch("g") ] = font.charH [ font.ch("j") ] = font.charH [ font.ch("p") ] = font.charH [ font.ch("q") ] = font.charH [ font.ch("y") ] = 30;
   font.charW [ font.ch(".") ] = font.charW [ font.ch(",") ] = font.charW [ font.ch(";") ] = font.charW [ font.ch(":") ] = 6;
   font.charH [ font.ch(",") ] = font.charH [ font.ch(";") ] = 27;
   font.baselineSkip = 27;
   font.finalize ();
}
