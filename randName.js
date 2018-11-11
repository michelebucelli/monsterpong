// Random name generation
// Takes in input an array of arrays of strings. When generating a random name,
// picks a string at random from each array and sticks them together. It can
// also be asked to generate a precise string with given chunk indices
var RandName = function ( chunks ) {
   this.chunks = chunks;

   // Returns a totally random name
   this.rnd = function ( ) {
      var result = "";

      for ( var i = 0; i < this.chunks.length; ++i )
         result += this.chunks[i][Math.floor(Math.random() * this.chunks[i].length)];

      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.substr(1);

      return result;
   }

   // Returns a name obtained by merging chunks corresponding to given indices
   this.get = function ( idx ) {
      var result = "";

      for ( var i = 0; i < this.chunks.length; ++i )
         result += this.chunks[i][idx[i] % this.chunks[i].length];

      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.substr(1);

      return result;
   }
}
