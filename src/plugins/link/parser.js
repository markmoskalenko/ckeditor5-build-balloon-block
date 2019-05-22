export function parseUrl( apiUrl, href ) {
	/* eslint-disable */
	const request = new XMLHttpRequest();
	/* eslint-enable */
	const api = `${ apiUrl }parser/meta?url=${ href }`;
	request.open( 'GET', api, false );
	request.send( 'null' );
	return JSON.parse( request.response );
}

export function getDomain( url ) {
	let hostname;

	// Убрать протокол
	if ( url.indexOf( '//' ) > -1 ) {
		hostname = url.split( '/' )[ 2 ];
	}

	// Убрать порт из ссылки
	hostname = hostname.split( ':' )[ 0 ];

	// Убрать параметры
	hostname = hostname.split( '?' )[ 0 ];

	return hostname;
}
