<?php


include __DIR__ . '/includes/class-ss-shipping-wc-order.php';

/**
 *  Extend WC Core.
 */
class Smart_Send_Extend_Woo_Core
{

	/**
	 * Plugin Identifier, unique to each plugin.
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
		$this->save_shipping_instructions();
	}


	/**
	 * Register  schema into the Checkout endpoint.
	 *
	 * @return array Registered schema.
	 */
	public function extend_checkout_schema()
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
	/** * Initializes session if not already started. */
	private function initialize_session()
	{
		if (session_status() === PHP_SESSION_NONE) {
			session_start();
		}
		if (!isset($_SESSION['initialized'])) {
			session_regenerate_id(true);
			$_SESSION['initialized'] = true;
		}
	}
	/**
	 * Saves the shipping instructions to the order's metadata.
	 *
	 * @return void
	 */
	private function save_shipping_instructions()
	{

		add_action(
			self::ACTION_SAVE_SHIPPING_INSTRUCTIONS,
			function (\WC_Order $order, \WP_REST_Request $request) {
				$smart_send_request_data = $request['extensions'][SS_SHIPPING_WOO_BLOCK_NAME];

				$pickup_points = $smart_send_request_data['selectedPickupPoints'];

				$pickup_points = explode('?', $pickup_points);


				$order->update_meta_data('ss_shipping_order_agent_no', $pickup_points[0]);

				$this->initialize_session();

				$agent_list = $_SESSION['ss_shipping_agents_blocks'];

				$selected_agent_no = 0;

				if ($agent_list) {
					foreach ($agent_list as $agent_key => $agent_value) {
						// If agent selected for the order, save it
						if ($agent_value->agent_no == $pickup_points[0]) {

							$selected_agent = $agent_value;
							$order->update_meta_data('_ss_shipping_order_agent', $selected_agent);
							break;
						}
					}
				}

				/**
				 * 💡Don't forget to save the order using `$order->save()`.
				 */
				$order->save();
			},
			10,
			2
		);
	}
}
