/**
 * External dependencies
 */
import { useEffect, useState, useCallback } from '@wordpress/element';
import { SelectControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { debounce, join } from 'lodash';
import { getShippingApiData } from './requestapi.js';

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
		const fetchShippingData = async () => {
			if ( ! isCalculating ) {
				var shippingAddress = checkoutDetails.shippingAddress;
				var shippingRatesDetails = checkoutDetails.shippingRates;
				shippingRatesDetails =
					getShippingRateId( shippingRatesDetails );

				var street = shippingAddress.address_1;
				var city = shippingAddress.city;
				var country = shippingAddress.country;
				var postcode = shippingAddress.postcode;
				var selected = shippingRatesDetails;
				if ( postcode && street && city && country ) {
					const shippingMetaData = await getShippingApiData(
						selected,
						country,
						postcode,
						city,
						street
					);
					// for pickuppoints blocks
					if ( shippingMetaData.pickup_points.length > 0 ) {
						const pickupDefaultValue =
							shippingMetaData.default_pickup == 'no'
								? shippingMetaData.pickup_points[ 0 ]
								: shippingMetaData.pickup_points[ 1 ];
						setavailablePickupPoints(
							shippingMetaData.pickup_points
						);
						setselectedPickupPoint( pickupDefaultValue );
						handlePickupPoints( shippingMetaData );
					}
				}
			}
		};
		fetchShippingData();
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

function handlePickupPoints( $shippingMetaData ) {
	let pickupOptionsHTML = '';
	var pickupPoints = $shippingMetaData.pickup_points;

	pickupPoints.forEach( ( pickupPoint ) => {
		const agentAddress = formatAgentAddress( pickupPoint );
		pickupOptionsHTML += `<option value="${ pickupPoint.agent_no }">${ agentAddress }</option>`;
	} );
	if ( $shippingMetaData.default_pickup == 'no' ) {
		jQuery( '.select_ss_pickup_point' )
			.find( 'select' )
			.append( pickupOptionsHTML );
	} else {
		jQuery( '.select_ss_pickup_point' )
			.find( 'select' )
			.html( pickupOptionsHTML );
	}
	togglePickupPointsSelector( $shippingMetaData );
}

function togglePickupPointsSelector( $shippingMetaData ) {
	if (
		$shippingMetaData.pickup_points.length > 1 &&
		$shippingMetaData.is_pickup
	) {
		jQuery( '.select_ss_pickup_point' ).show();
		jQuery( '.select_ss_pickup_point' ).css( 'opacity', 1 );
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
