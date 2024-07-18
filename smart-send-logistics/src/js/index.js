/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

const render = () => {};

registerPlugin( 'smart-send', {
	render,
	scope: 'woocommerce-checkout',
} );
