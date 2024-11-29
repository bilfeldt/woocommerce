/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

const render = () => {};

registerPlugin( 'smart-send-logistics', {
	render,
	scope: 'woocommerce-checkout',
} );
