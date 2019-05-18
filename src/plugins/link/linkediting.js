import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkCommand from '@ckeditor/ckeditor5-link/src/linkcommand';
import UnlinkCommand from '@ckeditor/ckeditor5-link/src/unlinkcommand';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from '@ckeditor/ckeditor5-link/src/findlinkrange';
import LinkRegistry from './linkregistry';
import { createLinkPreviewElement } from './utils';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { ensureSafeUrl, createLinkElement } from '@ckeditor/ckeditor5-link/src/utils';
import './theme.css';
import { modelToViewUrlAttributeConverter } from './converters';
import { parseUrl } from './parser';

const HIGHLIGHT_CLASS = 'ck-link_selected';

export default class LinkEditing extends Plugin {
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;

		const registry = new LinkRegistry( editor.locale, editor.config.get( 'link' ), editor );

		// Allow link attribute on all inline nodes.
		schema.extend( '$text', { allowAttributes: 'linkHref' } );
		schema.register( 'preview', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'url', 'routerLink', 'linkHref', 'info', 'href' ]
		} );

		editor.conversion.for( 'dataDowncast' )
			.attributeToElement( { model: 'linkHref', view: createLinkElement } )
			.elementToElement( {
				model: 'preview',
				view: ( modelElement, viewWriter ) => {
					const url = modelElement.getAttribute( 'url' );
					const previewInfo = modelElement.getAttribute( 'info' );
					return createLinkPreviewElement( viewWriter, registry, url, previewInfo );
				}
			} );

		editor.conversion.for( 'editingDowncast' )
			.attributeToElement( {
				model: 'linkHref', view: ( href, viewWriter ) => {
					return createLinkElement( ensureSafeUrl( href ), viewWriter );
				}
			} )
			.elementToElement( {
				model: 'preview', view: ( modelElement, viewWriter ) => {
					const url = modelElement.getAttribute( 'url' );
					const previewInfo = modelElement.getAttribute( 'info' );
					const element = createLinkPreviewElement( viewWriter, registry, url, previewInfo );

					return toWidget( element, viewWriter, { label: 'препросмотр ссылки', hasSelectionHandler: true } );
				}
			} );

		editor.conversion.for( 'editingDowncast' ).add(
			modelToViewUrlAttributeConverter( registry, {
				renderForEditingView: true
			} ) );

		editor.conversion.for( 'upcast' )
			.elementToAttribute( {
				view: {
					name: 'a',
					attributes: {
						href: true
					}
				},
				model: {
					key: 'linkHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} )
			.elementToElement( {
				view: { name: 'a', attributes: { href: true } },
				model: ( viewElement, viewWriter ) => {
					const url = viewElement.getAttribute( 'href' );
					const isPreview = viewElement.parent.childCount === 1 &&
						viewElement._children[ 0 ].data === url;

					const previewInfo = parseUrl( url );

					if ( registry.hasLinkInfo( url ) && isPreview && previewInfo.title ) {
						return viewWriter.createElement( 'preview', { url, info: previewInfo } );
					}
				}
			} );

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );

		// Enable two-step caret movement for `linkHref` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'linkHref' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();
	}

	_setupLinkHighlight() {
		const editor = this.editor;
		const view = editor.editing.view;
		const highlightedLinks = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;

			if ( selection.hasAttribute( 'linkHref' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ), editor.model );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
				// broken by a UIElement.
				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'a' ) ) {
						writer.addClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.add( item );
					}
				}
			}
		} );

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

			function removeHighlight() {
				view.change( writer => {
					for ( const item of highlightedLinks.values() ) {
						writer.removeClass( HIGHLIGHT_CLASS, item );
						highlightedLinks.delete( item );
					}
				} );
			}
		} );
	}
}
