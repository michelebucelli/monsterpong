// Bitmap font on canvas
var BitFont = function ( src, alphabet, charW, charH ) {
   // Source image for the bitmap font
   this.img = new Image();
   this.img.src = src;

   // Alphabet: a string containing the characters of the bitmap font in the
   // order they appear in the source image
   this.alphabet = alphabet;

   // The default size of each character
   this.charW = []; // Width (pixels)
   this.charH = []; // Height (pixels)

   // Baseline skip (how much to skip when newline)
   this.baselineSkip = charH + 1;

   // Bounding boxes for each character; to be computed with method finalize
   this.charBBoxes = [];

   // Initializes char size vectors with default values
   for ( var i = 0; i < this.alphabet.length; ++i ) {
      this.charW.push ( charW );
      this.charH.push ( charH );
   }

   // Find index of character in alphabet (or -1 if not found)
   this.ch = function ( char ) {
      return this.alphabet.indexOf(char);
   }

   // Pre-computes the bounding boxes for each character
   this.finalize = function ( ) {
      var x = 0;
      for ( var i = 0; i < this.alphabet.length; ++i ) { // For each character in the alphabet
         this.charBBoxes.push([x, 0, this.charW[i], this.charH[i]]);
         x += this.charW[i];
      }
   }

   // Render character; returns width of printed character
   this.renderChar = function ( ctxt, x, y, char ) {
      var chidx = this.ch(char);
      var bbox = this.charBBoxes[chidx];
      ctxt.drawImage ( this.img, bbox[0], bbox[1], bbox[2], bbox[3], x, y, bbox[2], bbox[3] );
      return bbox[2];
   }

   // Render text line
   this.renderText = function ( ctxt, x, y, text ) {
      var startX = x;

      for ( var i = 0; i < text.length; ++i ) {
         if ( text.charAt(i) == '\n' ) {
            y += this.baselineSkip;
            x = startX;
         }
         
         else x += this.renderChar ( ctxt, x, y, text.charAt(i) );
      }
   }
}
