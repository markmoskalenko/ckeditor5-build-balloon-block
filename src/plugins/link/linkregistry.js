import Template from '@ckeditor/ckeditor5-ui/src/template';
import { ensureSafeUrl } from '@ckeditor/ckeditor5-link/src/utils';

export default class LinkRegistry {
	constructor( locale, config, editor ) {
		this.locale = locale;
		this.config = config;
		this.editor = editor;
	}

	hasLinkInfo( url ) {
		return !!this._getInfo( url );
	}

	getLinkViewElement( writer, url, options ) {
		const info = this._getInfo( url );
		if ( info ) {
			return info.getViewElement( writer, options );
		}
	}

	_getInfo( url ) {
		return new LinkInformation( this.locale, url, this.config );
	}
}

class LinkInformation {
	constructor( locale, url, config ) {
		this.url = ensureSafeUrl( url );
		this.config = config;
	}

	getViewElement( writer, options ) {
		const attributes = {};

		if ( this.url ) {
			// const shouldCutUrl = this.config && this.config.host &&
			// 	this._shouldBeShort( this.url, this.config.host );

			// attributes[ 'routerLink' ] = JSON.stringify( [ shouldCutUrl ? this._shortUrl( this.url ) : this.url ] )
			attributes.href = this.url;
			const linkHtml = this._getPlaceholderHtml( options );
			return writer.createUIElement( 'div', attributes, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = linkHtml;

				return domElement;
			} );
		}
	}

	_getPlaceholderHtml( information ) {
		const placeholder = new Template( {
			tag: 'div',
			attributes: {
				class: 'ck ck-reset_all ck-content__link_preview ck-link',
				// target: '_blank',
				// href: this.url
			},
			children: [
				{
					tag: 'img',
					attributes: {
						class: 'ck-link__thumbnail',
						src: information.thumbnail_url
					}
				}, {
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
						},
						children: [ {
							tag: 'a',
							attributes: {
								class: 'ck-link__url-link',
								target: '_blank',
								href: this.url
								// routerLink: this.url
							},
							children: [ this.url ]
						} ]
					}, {
						tag: 'p',
						attributes: {
							class: 'ck-link__description'
						},
						children: [
							information.description
						]
					} ]
				},
			]
		} ).render();

		return placeholder.outerHTML;
	}

	_shortUrl( href ) {
		/* eslint-disable */
		const link = document.createElement( 'a' );
		/* eslint-enable */
		link.href = href;
		return link.pathname;
	}

	_shouldBeShort( href, base ) {
		let hostname;

		if ( !href || href == 'null' ) {
			return false;
		}

		// Убрать протокол
		if ( href.indexOf( '//' ) > -1 ) {
			hostname = href.split( '/' )[ 2 ];
		}

		// Убрать порт из ссылки
		hostname = hostname.split( ':' )[ 0 ];

		// Убрать параметры
		hostname = hostname.split( '?' )[ 0 ];

		return hostname === base;
	}
}
