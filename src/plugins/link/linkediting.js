import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkCommand from '@ckeditor/ckeditor5-link/src/linkcommand';
import UnlinkCommand from '@ckeditor/ckeditor5-link/src/unlinkcommand';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from '@ckeditor/ckeditor5-link/src/findlinkrange';
import { ensureSafeUrl, createLinkElement } from '@ckeditor/ckeditor5-link/src/utils';
import './theme.css';
import { parseUrl, getDomain } from './parser';
import { toWidget, toWidgetEditable, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';

const HIGHLIGHT_CLASS = 'ck-link_selected';

export default class LinkEditing extends Plugin {
	init() {
		const editor = this.editor;

		this._defineSchema();
		this._defineConversions();

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'ck-link' ) )
		);

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );

		// Enable two-step caret movement for `linkHref` attribute.
		bindTwoStepCaretToAttribute( {
			view: editor.editing.view,
			model: editor.model,
			emitter: this,
			attribute: 'linkHref',
			locale: editor.locale
		} );

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

	_defineSchema() {
		const schema = this.editor.model.schema;

		// Allow link attribute on all inline nodes.
		schema.extend( '$text', { allowAttributes: 'linkHref' } );
		schema.register( 'preview', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'url', 'routerLink', 'linkHref', 'info', 'href' ]
		} );

		schema.register( 'previewLinkTitle', {
			isLimit: true,
			allowIn: 'previewLinkContainer',
			allowContentOf: '$block',
			allowAttributes: [ 'text' ]
		} );

		schema.register( 'previewLinkDescription', {
			isLimit: true,
			allowIn: 'previewLinkContainer',
			allowContentOf: '$block',
			allowAttributes: [ 'text' ]
		} );

		schema.register( 'previewLinkUrl', {
			isLimit: true,
			allowIn: 'previewLinkContainer',
			allowContentOf: '$block',
			allowAttributes: [ 'href' ]
		} );

		schema.register( 'previewLinkImage', {
			isLimit: true,
			allowIn: 'preview',
			allowAttributes: [ 'src', 'src' ]
		} );

		schema.register( 'previewLinkContainer', {
			isLimit: true,
			allowIn: 'preview',
			allowAttributes: []
		} );
	}

	_defineConversions() {
		const conversion = this.editor.conversion;

		/* Превью и обычные ссылки */
		conversion.for( 'upcast' )
			.elementToAttribute( {
				view: { name: 'a', attributes: { href: true } },
				model: { key: 'linkHref', value: viewElement => viewElement.getAttribute( 'href' ) }
			} )
			.elementToElement( { model: 'preview', view: { name: 'section', classes: 'ck-link' } } );

		/* Из просто ссылки сделать превью блок */
		// .elementToElement( {
		// 	view: { name: 'a', attributes: { href: true } },
		// 	model: viewElement => {
		// 		const shouldNotParse = viewElement.getAttribute( 'donotparse' );
		//
		// 		if ( this._isPreview( viewElement ) && !shouldNotParse ) {
		// 			const url = viewElement.getAttribute( 'href' );
		// 			const previewInfo = this._getPreviewInfo( url );
		//
		// 			if ( previewInfo.title ) {
		// 				return this._createPreviewBlock( previewInfo, url );
		// 			}
		// 		}
		// 	}
		// } );

		conversion.for( 'dataDowncast' )
			.attributeToElement( {
				model: 'linkHref', view: ( href, viewWriter ) => {
					const link = createLinkElement( href, viewWriter );
					viewWriter.setAttribute( 'donotparse', true, link );
					return link;
				}
			} )
			.elementToElement( { model: 'preview', view: { name: 'section', classes: 'ck-link' } } );

		conversion.for( 'editingDowncast' )
			.attributeToElement( {
				model: 'linkHref', view: ( href, viewWriter ) => {
					const link = createLinkElement( ensureSafeUrl( href ), viewWriter );
					viewWriter.setAttribute( 'donotparse', true, link );
					return link;
				}
			} )
			.elementToElement( {
				model: 'preview', view: ( modelElement, viewWriter ) => {
					const section = viewWriter.createContainerElement( 'section', { class: 'ck-link' } );
					return toWidget( section, viewWriter, {} );
				}
			} );

		/* Preview Title */
		conversion.for( 'upcast' ).elementToElement( {
			model: 'previewLinkTitle',
			view: {
				name: 'h1',
				classes: 'ck-link__header'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'previewLinkTitle',
			view: {
				name: 'h1',
				classes: 'ck-link__header'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'previewLinkTitle',
			view: ( modelElement, viewWriter ) => {
				const title = viewWriter.createEditableElement( 'h1', { class: 'ck-link__header' } );
				return toWidgetEditable( title, viewWriter );
			}
		} );

		/* Preview Description */
		conversion.for( 'upcast' ).elementToElement( {
			model: 'previewLinkDescription',
			view: {
				name: 'p',
				classes: 'ck-link__description'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'previewLinkDescription',
			view: {
				name: 'p',
				classes: 'ck-link__description'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'previewLinkDescription',
			view: ( modelElement, viewWriter ) => {
				const paragraph = viewWriter.createEditableElement( 'p', { class: 'ck-link__description' } );
				return toWidgetEditable( paragraph, viewWriter );
			}
		} );

		/* Preview URL */
		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: { name: 'a', key: 'href' },
				model: {
					key: 'href',
					value: viewLink => {
						const href = viewLink.getAttribute( 'href' );
						return { linkHref: href };
					}
				}
			} )
			.elementToAttribute( {
				view: { name: 'a', attributes: { href: true } },
				model: { key: 'linkHref', value: viewElement => viewElement.getAttribute( 'href' ) }
			} )
			.elementToElement( {
				view: { name: 'a', attributes: { href: true } },
				model: ( modelElement, modelWriter ) => {
					const href = modelElement.getAttribute( 'href' );
					const link = modelWriter.createElement( 'previewLinkUrl', { href, linkHref: href } );
					return link;
				}
			} );

		conversion.for( 'dataDowncast' )
			.attributeToAttribute( {
				view: { name: 'a', key: 'href' },
				model: {
					key: 'href',
					value: viewLink => {
						const href = viewLink.getAttribute( 'href' );
						return {
							linkHref: href,
							href
						};
					}
				}
			} )
			.elementToElement( {
				model: 'previewLinkUrl',
				view: {
					name: 'a',
					classes: 'ck-link__url'
				}
			} );

		conversion.for( 'editingDowncast' )
			.attributeToAttribute( {
				view: { name: 'a', key: 'href' },
				model: {
					key: 'href',
					value: viewLink => {
						const href = viewLink.getAttribute( 'href' );
						return { linkHref: href };
					}
				}
			} )
			.elementToElement( {
				model: 'previewLinkUrl',
				view: ( modelElement, viewWriter ) => {
					const href = modelElement.getAttribute( 'href' );
					const paragraph = viewWriter.createEditableElement( 'a', {
						class: 'ck-link__url',
						href
					} );

					return toWidgetEditable( paragraph, viewWriter );
				}
			} );

		/* Preview Image */
		conversion.for( 'upcast' )
			.elementToElement( {
				view: { name: 'img', attributes: { src: true } },
				model: ( viewImage, modelWriter ) => {
					return modelWriter.createElement( 'previewLinkImage', { src: viewImage.getAttribute( 'src' ) } );
				}
			} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'previewLinkImage',
			view: ( modelElement, writer ) => {
				const src = modelElement.getAttribute( 'src' );
				const image = writer.createEmptyElement( 'img', { src, class: 'ck-link__image' } );
				return image;
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'previewLinkImage',
			view: ( modelElement, viewWriter ) => {
				const image = modelElement.getAttribute( 'src' );
				const figure = viewWriter.createEmptyElement( 'img', {
					class: 'ck-link__image',
					src: image
				} );

				return figure;
			}

		} );

		/* Preview Container */
		conversion.for( 'upcast' ).elementToElement( {
			model: 'previewLinkContainer',
			view: {
				name: 'div',
				classes: 'ck-link__container'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'previewLinkContainer',
			view: {
				name: 'div',
				classes: 'ck-link__container'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'previewLinkContainer',
			view: ( modelElement, viewWriter ) => {
				const div = viewWriter.createContainerElement( 'div', {
					class: 'ck-link__container'
				} );

				return div;
			}
		} );
	}

	_createPreviewBlock( previewInfo, url ) {
		return this.editor.model.change( writer => {
			const preview = writer.createElement( 'preview', { href: url, info: previewInfo } );
			const container = writer.createElement( 'previewLinkContainer' );

			const previewTitle = writer.createElement( 'previewLinkTitle' );
			const previewDescription = writer.createElement( 'previewLinkDescription' );
			const previewUrl = writer.createElement( 'previewLinkUrl', { href: url } );
			const previewImage = writer.createElement( 'previewLinkImage', { image: previewInfo.image } );

			writer.setAttribute( 'src', previewInfo.image, previewImage );

			writer.appendText( previewInfo.title, {}, previewTitle );
			writer.appendText( previewInfo.description, {}, previewDescription );
			writer.appendText( getDomain( url ), { /* 'linkHref': url */ }, previewUrl );

			writer.append( previewTitle, container );
			writer.append( previewDescription, container );
			writer.append( previewUrl, container );

			writer.append( container, preview );
			writer.append( previewImage, preview );

			return preview;
		} );
	}

	_getPreviewInfo( url ) {
		return parseUrl( this.editor.config.get( 'link.api' ), url );
	}

	_isPreview( viewElement ) {
		const url = viewElement.getAttribute( 'href' );

		const selection = this.editor.model.document.selection.getFirstPosition();
		const isPreview = selection && selection.parent && selection.parent.childCount === 0 &&
			viewElement.parent && viewElement.parent.childCount === 1 &&
			viewElement.childCount === 1 && viewElement._children[ 0 ]._textData === url;

		return isPreview;
	}
}
