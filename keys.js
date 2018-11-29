var keys = new Array();
var registerKey = function ( n, k ) { keys.push ( { name: n, key: k, state: undefined } ); };

var key = function ( name ) {
	var result = 0;
	for ( i = 0; i < keys.length; i++ )
		if ( keys[i].name == name ) result = result || keys[i].state;
	return result;
}

var setupKeys = function ( ) {
   document.addEventListener ( "keydown", function ( e ) {
   	for ( var i = 0; i < keys.length; i++ )
   		if ( e.key == keys[i].key ) keys[i].state = 1;
   } );

   document.addEventListener ( "keyup", function ( e ) {
   	for ( var i = 0; i < keys.length; i++ )
   		if ( e.key == keys[i].key ) keys[i].state = 0;
   } );
}
