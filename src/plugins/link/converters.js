import { parseUrl } from './parser';

export function modelToViewUrlAttributeConverter( registry, options ) {
	return dispatcher => {
		dispatcher.on( 'attribute:url:preview', converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const url = data.attributeNewValue;
		const information = parseUrl( url );
		const viewWriter = conversionApi.writer;
		const figure = conversionApi.mapper.toViewElement( data.item );
		viewWriter.remove( viewWriter.createRangeIn( figure ) );
		const linkViewElement = registry.getLinkViewElement( viewWriter, url, options, information );
		viewWriter.insert( viewWriter.createPositionAt( figure, 0 ), linkViewElement );
	}
}
