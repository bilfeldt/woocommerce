<?php

use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CheckoutSchema;

/**
 *  Extend Store API.
 */
class Smart_Send_Extend_Store_Endpoint
{
	/**
	 * Stores Rest Extending instance.
	 *
	 * @var ExtendRestApi
	 */
	private static $extend;

	/**
	 * Plugin Identifier, unique to each plugin.
	 *
	 * @var string
	 */

	const IDENTIFIER = SS_SHIPPING_WOO_BLOCK_NAME;

	/**
	 * Bootstraps the class and hooks required data.
	 */
	public static function init()
	{
		self::$extend = Automattic\WooCommerce\StoreApi\StoreApi::container()->get(Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema::class);
		self::extend_store();
	}

	/**
	 * Registers the actual data into each endpoint.
	 */
	public static function extend_store()
	{

		if (is_callable([self::$extend, 'register_endpoint_data'])) {
			self::$extend->register_endpoint_data(
				[
					'endpoint'        => CheckoutSchema::IDENTIFIER,
					'namespace'       => self::IDENTIFIER,
					'schema_callback' => ['Smart_Send_Extend_Store_Endpoint', 'extend_checkout_schema'],
					'schema_type'     => ARRAY_A,
				]
			);
		}
	}


	/**
	 * Register  schema into the Checkout endpoint.
	 *
	 * @return array Registered schema.
	 */
	public static function extend_checkout_schema()
	{

		return [
			'selectedPickupPoints' => [
				'description' => 'Alternative Shipping Pickup Points',
				'type'        => 'string',
				'context'     => ['view', 'edit'],
				'readonly'    => true,
				'arg_options' => [
					'validate_callback' => function ($value) {
						return is_string($value);
					},
				],
			],
		];
	}
}
