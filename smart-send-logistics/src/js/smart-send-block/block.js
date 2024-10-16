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
import { countries } from './countries';

export const Block = ( { checkoutExtensionData, extensions } ) => {
	const isCalculating = useSelect( ( select ) => {
		const store = select( 'wc/store/checkout' );
		return store.isCalculating();
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
		var street = setValue( 'shipping-address_1' );
		var city = setValue( 'shipping-city' );
		var country = setValue( 'components-form-token-input-0' );
		country = countries[ country ];
		var postcode = setValue( 'shipping-postcode' );
		var selected = jQuery( '.wc-block-components-shipping-rates-control' )
			.find( 'input[type=radio]:checked' )
			.val();

		const fetchPickupPoint = async () => {
			if ( isCalculating ) {
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
	var carrier = await getShippingCarrier( ss_agent );
	var defaultvalue = getPickupPoints(
		carrier,
		country,
		postalCode,
		city,
		street
	);
	return defaultvalue;
}

function setValue( id ) {
	var element = document.getElementById( id );
	if ( element ) {
		return element.value;
	}
	return null;
}

const getPickupPoints = async (
	carrier,
	country,
	postalCode,
	city,
	street
) => {
	const url = '/wp-json/smart-send-logistics/v1/get-closest-pickup-points'; // Custom endpoint registered by this package

	const data = {
		country: country,
		postCode: postalCode,
		city: city,
		street: street,
		carrier: carrier,
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
			return [];
		} else {
			const pickupPoints = await response.json();
			if ( Array.isArray( pickupPoints ) ) {
				let pickupOptionsHTML = '';
				pickupPoints.forEach( ( pickupPoint ) => {
					const agentAddress = formatAgentAddress( pickupPoint );
					pickupOptionsHTML += `<option value="${ pickupPoint.agent_no }">${ agentAddress }</option>`;
				} );
				jQuery( '.select_ss_pickup_point' )
					.find( 'select' )
					.html( pickupOptionsHTML );
				getSelectedShippingMethod();
			} else {
				return [];
			}

			return pickupPoints;
		}
	} catch ( error ) {
		alert( 'Failed to fetch pick-up points' );
	}
};

function getSelectedShippingMethod() {
	var selected = jQuery( '.wc-block-components-shipping-rates-control' )
		.find( 'input[type=radio]:checked' )
		.val();
	if ( selected.indexOf( 'smart_send' ) !== -1 ) {
		jQuery( '.select_ss_pickup_point' ).show();
		jQuery( '.select_ss_pickup_point' ).css( 'opacity', 1 );
		return selected;
	} else {
		jQuery( '.select_ss_pickup_point' ).hide();
		jQuery( '.select_ss_pickup_point' ).css( 'opacity', 0 );
	}
}

const getShippingCarrier = async ( shipping_method ) => {
	const url = '/wp-json/smart-send-logistics/v1/get-shipping-carrier'; // Custom endpoint registered by this package

	const data = {
		ss_method: shipping_method,
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
		} else {
			const results = await response.json();
			return results.carrier;
		}
	} catch ( error ) {
		alert( 'Failed to fetch Shipping Carrier' );
	}
};

function formatAgentAddress(pickupPoint) {
	const distance = parseFloat(pickupPoint.distance); // Parse once and reuse
	const formattedDistance = distance >= 1 
	  ? distance.toFixed(2) + ' km' 
	  : Math.round(distance * 1000) + ' m'; // Renamed to reflect it's formatted
	
	return `${formattedDistance}: ${pickupPoint.company} ${pickupPoint.address_line1} ${pickupPoint.postal_code} ${pickupPoint.city}`;
  }
