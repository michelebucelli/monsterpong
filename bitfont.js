// Bitmap font on canvas
var BitFont = function ( src, alphabet, charW, charH ) {
   // Source image for the bitmap font
   // Should have one line for each color containing all the alphabet; the
   // height of this line is specified by the member colorLineHeight
   this.img = new Image();
   this.img.src = src;

   // Alphabet: a string containing the characters of the bitmap font in the
   // order they appear in the source image
   this.alphabet = alphabet;

   // The default size of each character
   this.charWBase = charW; // Base character width (used for spaces)
   this.charW = []; // Width (pixels)
   this.charH = []; // Height (pixels)

   // Height of the line corresponding to a color
   this.colorLineHeight = charH;

   // Baseline skip (how much to skip when newline)
   this.baselineSkip = charH + 1;

   // Bounding boxes for each character; to be computed with method finalize
   this.charBBoxes = [];
   this.finalized = false;

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
      console.log ( "FINALIZING BITMAP FONT" );
      var x = 0;
      for ( var i = 0; i < this.alphabet.length; ++i ) { // For each character in the alphabet
         this.charBBoxes.push([x, 0, this.charW[i], this.charH[i]]);
         x += this.charW[i];
      }

      this.finalized = true;
   }

   // Render character; returns width of printed character
   this.renderChar = function ( ctxt, x, y, char, color ) {
      if ( !this.finalized ) // Finalize if necessary
         this.finalize();

      if ( char == " " )
         return this.charWBase;

      var chidx = this.ch(char);
      if ( chidx >= 0 ) {
         var bbox = this.charBBoxes[chidx];
         ctxt.drawImage ( this.img, bbox[0], bbox[1] + color*this.colorLineHeight, bbox[2], bbox[3], x, y, bbox[2], bbox[3] );
         return bbox[2];
      }
      else return this.charWBase;
   }

   // Render text
   this.renderText = function ( ctxt, x, y, text, color ) {
      var startX = x;

      for ( var i = 0; i < text.length; ++i ) {
         if ( text.charAt(i) == '\n' ) {
            y += this.baselineSkip;
            x = startX;
         }

         else x += this.renderChar ( ctxt, x, y, text.charAt(i), color );
      }
   }

   // Compute width of char
   this.charWidth = function ( char ) {
      if ( !this.finalized ) // Finalize if necessary
         this.finalize();

      if ( char == " " )
         return this.charWBase;

      var chidx = this.ch(char);
      if ( chidx > 0 )
         return this.charBBoxes[chidx][2];
      else return this.charWBase;
   }

   // Compute width of (a single line of) text
   this.textWidth = function ( text ) {
      var result = 0;
      for ( var i = 0; i < text.length; ++i )
         result += this.charWidth ( text.charAt(i) );
      return result;
   }
}
