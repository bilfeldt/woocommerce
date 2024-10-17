/**
 * External dependencies
 */
import { useEffect, useState, useCallback } from '@wordpress/element';
import { SelectControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { debounce, join } from 'lodash';

/**
 * Internal dependencies
 */
import { options } from './options';

export const Block = ( { checkoutExtensionData, extensions } ) => {
	const isCalculating = useSelect( ( select ) => {
		const store = select( 'wc/store/checkout' );
		return store.isCalculating();
	} );
	const checkoutDetails = useSelect( ( select ) => {
		var storeCart = select( 'wc/store/cart' );
		storeCart = storeCart.getCartData();
		return storeCart;
	} );

	const { setExtensionData } = checkoutExtensionData;
	const debouncedSetExtensionData = useCallback(
		debounce( ( namespace, key, value ) => {
			setExtensionData( namespace, key, value );
		}, 1000 ),
		[ setExtensionData ]
	);

	const validationErrorId = 'smart-send-other-value';

	const [ availablePickupPoints, setavailablePickupPoints ] = useState( [] );

	const { setValidationErrors, clearValidationError } = useDispatch(
		'wc/store/validation'
	);

	const validationError = useSelect( ( select ) => {
		const store = select( 'wc/store/validation' );

		return store.getValidationError( validationErrorId );
	} );
	const [ selectedPickupPoint, setselectedPickupPoint ] =
		useState( 'try-again' );
	useEffect( () => {
		const fetchPickupPoint = async () => {
			if ( ! isCalculating ) {
				var shippingAddress = checkoutDetails.shippingAddress;
				var shippingRatesDetails = checkoutDetails.shippingRates;
				shippingRatesDetails = getShippingRateId( shippingRatesDetails );

				var street = shippingAddress.address_1;
				var city = shippingAddress.city;
				var country = shippingAddress.country;
				var postcode = shippingAddress.postcode;
				var selected = shippingRatesDetails;
				if ( postcode && street && city && country ) {
					const pickupPoints = await findClosestAgentByAddress(
						selected,
						country,
						postcode,
						city,
						street
					);
					if ( pickupPoints.length > 0 ) {
						const pickupDefaultValue = pickupPoints[ 0 ];
						setavailablePickupPoints( pickupPoints );
						setselectedPickupPoint( pickupDefaultValue );
					}
				}
			}
		};
		fetchPickupPoint();
	}, [ isCalculating ] );

	useEffect( () => {
		setExtensionData(
			'smart-send-logistics',
			'selectedPickupPoint',
			selectedPickupPoint
		);
	}, [ setExtensionData, selectedPickupPoint ] );

	const [ hasInteractedWithOtherInput, setHasInteractedWithOtherInput ] =
		useState( false );

	useEffect( () => {
		if ( setselectedPickupPoint !== 'other' ) {
			if ( validationError ) {
				clearValidationError( validationErrorId );
			}
			return;
		}
		setValidationErrors( {
			[ validationErrorId ]: {
				message: __(
					'Please select a valid pickup point',
					'smart-send-logistics'
				),
				hidden: ! hasInteractedWithOtherInput,
			},
		} );
	}, [
		clearValidationError,
		setselectedPickupPoint,
		setValidationErrors,
		validationErrorId,
		debouncedSetExtensionData,
		validationError,
	] );
	const handlePickupPointChange = ( agentNo ) => {
		const selectedPoint = availablePickupPoints.find(
			( pickupPoint ) => pickupPoint.agent_no === agentNo
		);
		if ( selectedPoint ) {
			setselectedPickupPoint( selectedPoint );
		}
	};

	return (
		<div className="wp-block-smart-send-pickup-points">
			<SelectControl
				label={ __( 'Select pick-up point', 'smart-send-logistics' ) }
				value={ selectedPickupPoint[ 'agent_no' ] }
				options={ options }
				onChange={ handlePickupPointChange }
				className="select_ss_pickup_point"
			/>
		</div>
	);
};

// Function to find closest agent by address
async function findClosestAgentByAddress(
	ss_agent,
	country,
	postalCode,
	city,
	street
) {
	country = country;
	postalCode = postalCode;
	city = city;
	street = street;
	var shipping_method = ss_agent;
	var defaultvalue = getPickupPoints(
		shipping_method,
		country,
		postalCode,
		city,
		street
	);
	return defaultvalue;
}


const getPickupPoints = async (
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
			var pickupPoints = pickupPointsResults.pickup_points;
			if (
				Array.isArray( pickupPoints ) &&
				pickupPointsResults.is_pickup
			) {
				let pickupOptionsHTML = '';

				pickupPoints.forEach( ( pickupPoint ) => {
					const agentAddress = formatAgentAddress( pickupPoint );
					pickupOptionsHTML += `<option value="${ pickupPoint.agent_no }">${ agentAddress }</option>`;
				} );
				if ( pickupPointsResults.default_pickup == 'no' ) {
					jQuery( '.select_ss_pickup_point' )
						.find( 'select' )
						.append( pickupOptionsHTML );
					const addpickupPoint = { 0: 'select the endpoint' };
					pickupPoints.unshift( addpickupPoint );
				} else {
					jQuery( '.select_ss_pickup_point' )
						.find( 'select' )
						.html( pickupOptionsHTML );
				}
				getSelectedShippingMethod( carrier );
			} else {
				return [ { 0: 'select the endpoint' } ];
			}

			return pickupPoints;
		}
	} catch ( error ) {
		alert( 'Failed to fetch pick-up points' );
	}
};

function getSelectedShippingMethod( carrier ) {
	var selected = carrier;
	if ( selected.indexOf( 'smart_send' ) !== -1 ) {
		jQuery( '.select_ss_pickup_point' ).show();
		jQuery( '.select_ss_pickup_point' ).css( 'opacity', 1 );
		return selected;
	} else {
		jQuery( '.select_ss_pickup_point' ).hide();
		jQuery( '.select_ss_pickup_point' ).css( 'opacity', 0 );
	}
}

function formatAgentAddress( pickupPoint ) {
	const distance = parseFloat( pickupPoint.distance ); // Parse once and reuse
	const formattedDistance =
		distance >= 1
			? distance.toFixed( 2 ) + ' km'
			: Math.round( distance * 1000 ) + ' m'; // Renamed to reflect it's formatted

	return `${ formattedDistance }: ${ pickupPoint.company } ${ pickupPoint.address_line1 } ${ pickupPoint.postal_code } ${ pickupPoint.city }`;
}

function getShippingRateId( shippingRates ) {
	var shippingRateId = 0;
	if ( Array.isArray( shippingRates ) ) {
		shippingRates.forEach( function ( item, index ) {
			var itemShippingRates = item.shipping_rates;

			if ( Array.isArray( itemShippingRates ) ) {
				itemShippingRates.forEach( function ( item, index ) {
					if ( item.selected ) {
						shippingRateId = item.rate_id;
					}
				} );
			}
		} );
	}
	return shippingRateId;
}
