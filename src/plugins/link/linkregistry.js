import Template from '@ckeditor/ckeditor5-ui/src/template';
import { ensureSafeUrl } from '@ckeditor/ckeditor5-link/src/utils';
import { getDomain } from './parser';

export default class LinkRegistry {
	constructor( locale, config, editor ) {
		this.locale = locale;
		this.config = config;
		this.editor = editor;
	}

	hasLinkInfo( url ) {
		return !!this._getInfo( url );
	}

	getLinkViewElement( writer, url, options, information ) {
		const info = this._getInfo( url );
		if ( info ) {
			return info.getViewElement( writer, options, information );
		}
	}

	_getInfo( url ) {
		if ( !url ) {
			return new LinkInformation( this.locale );
		}

		return new LinkInformation( this.locale, url, this.config );
	}
}

class LinkInformation {
	constructor( locale, url, config ) {
		this.url = ensureSafeUrl( url );
		this.config = config;
	}

	getViewElement( writer, options, information ) {
		const attributes = {};
		if ( options.renderForEditingView ) {
			if ( this.url ) {
				attributes.href = this.url;
				const linkHtml = this._getPlaceholderHtml( information );
				return writer.createUIElement( 'div', attributes, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					domElement.innerHTML = linkHtml;

					return domElement;
				} );
			}
		} else {
			if ( this.url ) {
				attributes.href = this.url;
			}

			const linkHtml = this._getSimpleLinkHtml();
			return writer.createUIElement( 'a', attributes, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = linkHtml;

				return domElement;
			} );
		}
	}

	_getSimpleLinkHtml() {
		const link = new Template( {
			tag: 'span',
			children: [ this.url ]
		} ).render();

		return link.outerHTML;
	}

	_getPlaceholderHtml( information ) {
		const placeholder = new Template( {
			tag: 'div',
			attributes: {
				class: 'ck ck-reset_all ck-content__link_preview ck-link',
				// target: '_blank',
				// href: this.url
			},
			children: [ {
				tag: 'div',
				attributes: {
					class: 'ck-link__container'
				},
				children: [ {
					tag: 'p',
					attributes: {
						class: 'ck-link__header'
					},
					children: [
						information.title
					]
				}, {
					tag: 'div',
					attributes: {
						class: 'ck-link__url',
					}
				}, {
					tag: 'p',
					attributes: {
						class: 'ck-link__description'
					},
					children: [
						information.description
					],
				}, {
					tag: 'a',
					attributes: {
						class: 'ck-link__url-link',
						target: '_blank',
						href: this.url
					},
					children: [ getDomain( this.url ) ]
				} ]
			}, {
				tag: 'div',
				attributes: {
					class: 'ck-link__thumbnail',
					style: `background-image: url(${ information.image })`,
				}
			} ]
		} ).render();

		return placeholder.outerHTML;
	}
}
