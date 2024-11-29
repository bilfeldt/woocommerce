/*
 API Reuest Function or hook
 **/
export const getShippingApiData = async (
	carrier,
	country,
	postalCode,
	city,
	street
) => {
	const url = '/wp-json/smart-send-logistics/v1/checkout/shipping'; // Custom endpoint registered by this package

	const data = {
		country: country,
		postCode: postalCode,
		city: city,
		street: street,
		shipping_method: carrier,
	};

	try {
		const response = await fetch( url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( data ),
		} );

		if ( ! response.ok ) {
			const errorData = await response.json();
			jQuery( '.select_ss_pickup_point' ).hide();
			jQuery( '.select_ss_pickup_point' ).css( 'opacity', 0 );
			return [ { 0: 'select the endpoint' } ];
		} else {
			const pickupPointsResults = await response.json();
			if ( pickupPointsResults.pickup_points.length <= 0 ) {
				const addpickupPoint = { 0: 'select the endpoint' };
				pickupPointsResults.pickup_points.unshift( addpickupPoint );
			}
			return pickupPointsResults;
		}
	} catch ( error ) {
		console.error( 'Failed to fetch pick-up points' );
	}
};
