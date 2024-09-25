<?php


include '../includes/class-ss-shipping-wc-order.php';
include  'smart-send-utility-session.php';
/**
 * Class Smart_Send_Extend_Woo_Core
 *
 * Extends the WooCommerce core functionality for the Smart Send Logistics plugin.
 *
 * This class hooks into the WooCommerce Store API to extend the checkout schema and save custom
 * shipping instructions to the order metadata. It also manages session initialization for storing
 * shipping agent data.
 *
 * @package    SmartSendLogistics
 * @subpackage WooCommerce Integration
 * @category   WooCommerce API Data Storing
 * @author     Smart Send
 */

class Smart_Send_Extend_Woo_Core
{

	/**
	 * Action hook for saving shipping instructions.
	 *
	 * @var string
	 */
	const ACTION_SAVE_SHIPPING_INSTRUCTIONS = 'woocommerce_store_api_checkout_update_order_from_request';

	/**
	 * Bootstraps the class and hooks required data.
	 * 
	 * @return void
	 */
	public function init()
	{
		$this->save_pickup_point();
	}

	/**
	 * Register  schema into the Checkout endpoint.
	 *
	 * @return array Registered schema.
	 */
	public function extend_checkout_schema()
	{
		return [
			'selectedPickupPoint' => [
				'description' => 'Selected shipping pick-up point',
				'type'        => 'object',
				'context'     => ['view', 'edit'],
				'readonly'    => true,
				'arg_options' => [
					'validate_callback' => function ($value) {
						return is_array($value);
					},
				],
			],
		];
	}

	/** * Initializes session if not already started. */
	private function initialize_session()
	{
		Smart_Send_Utility_Session::initialize();
	}

	/**
	 * Saves the pickup point to the order's metadata.
	 *
	 * @return void
	 */
	private function save_pickup_point()
	{
		add_action(
			self::ACTION_SAVE_SHIPPING_INSTRUCTIONS,
			function (\WC_Order $order, \WP_REST_Request $request) {
				$smart_send_request_data = $request['extensions'][SS_SHIPPING_WOO_BLOCK_NAME];
				$pickup_point = $smart_send_request_data['selectedPickupPoint'];

				// Update agent number
				$order->update_meta_data('ss_shipping_order_agent_no', $pickup_point['agent_no']);

				$pickup_point = json_decode(json_encode($pickup_point));

				// Update the entire pickup point object
				$order->update_meta_data('_ss_shipping_order_agent', $pickup_point);

				// Save the order 
				$order->save();
			},
			10,
			2
		);
	}
}
