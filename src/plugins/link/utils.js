export function createLinkPreviewElement( writer, registry, url, information ) {
	const element = writer.createContainerElement( 'p', { class: 'ck-link' } );
	element.getFillerOffset = getFillerOffset;

	const linkElement = registry.getLinkViewElement( writer, url, {}, information );
	writer.insert( writer.createPositionAt( element, 0 ), linkElement );
	return element;
}

function getFillerOffset() {
	return null;
}
