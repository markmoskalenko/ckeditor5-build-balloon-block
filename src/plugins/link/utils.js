export function createLinkPreviewElement( writer, registry, url, options ) {
	const element = writer.createContainerElement( 'div', { class: 'link' } );
	element.getFillerOffset = getFillerOffset;

	const linkElement = registry.getLinkViewElement( writer, url, options );
	writer.insert( writer.createPositionAt( element, 0 ), linkElement );
	return element;
}

function getFillerOffset() {
	return null;
}
