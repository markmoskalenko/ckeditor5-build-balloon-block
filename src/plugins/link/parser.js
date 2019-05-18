export function parseUrl( href ) {
	/* eslint-disable */
	const request = new XMLHttpRequest();
	/* eslint-enable */
	const api = `https://ckeditor.iframe.ly/api/oembed?url=${ href }`;
	request.open( 'GET', api, false );
	request.send( 'null' );
	return JSON.parse( request.response );
}
