<?php

use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CheckoutSchema;

/**
 * Class Smart_Send_Extend_Store_Endpoint
 *
 * Extends the WooCommerce Store API to add custom data to endpoints.
 *
 * This class is responsible for registering custom schema data to the
 * WooCommerce Store API endpoints, such as the checkout endpoint.
 *
 * @package    Smart-Send-Logistics
 * @subpackage API Extension
 * @category   WooCommerce Blocks Checkout API Schema
 * @author     Smart Send
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
	 *
	 * Initializes the class by getting the instance of the ExtendSchema and
	 * registering the custom schema data to the store API endpoints.
	 *
	 * @return void
	 */
	public static function init()
	{
		self::$extend = Automattic\WooCommerce\StoreApi\StoreApi::container()->get(Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema::class);
		self::extend_store();
	}

	/**
	 * Registers the actual data into each endpoint.
	 *
	 * Registers the custom schema data to the WooCommerce Store API endpoints.
	 *
	 * @return void
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
	 * Registers schema into the Checkout endpoint.
	 *
	 * @return array Registered schema.
	 */
	public static function extend_checkout_schema()
	{
		return [
			'selectedPickupPoint' => [
				'description' => 'Selected shipping pick-up point',
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
