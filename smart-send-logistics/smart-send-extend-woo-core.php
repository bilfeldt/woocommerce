<?php

use Automattic\WooCommerce\Blocks\Package;
use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CartSchema;
use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CheckoutSchema;
use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use WooCommerce\Classes\WC_Order;

include __DIR__ . '/includes/class-ss-shipping-wc-order.php';

/**
 *  Extend WC Core.
 */

class smart_send_Extend_Woo_Core
{

	/**
	 * Plugin Identifier, unique to each plugin.
	 *
	 * @var string
	 */
	private $name = 'smart-send-logistics';

	/**
	 * Bootstraps the class and hooks required data.
	 */
	public function init()
	{
		$this->save_shipping_instructions();
		$this->show_shipping_instructions_in_order();
		$this->show_shipping_instructions_in_order_confirmation();
		$this->show_shipping_instructions_in_order_email();
	}


	/**
	 * Register  schema into the Checkout endpoint.
	 *
	 * @return array Registered schema.
	 */
	public function extend_checkout_schema()
	{

		return [
			'selectedpickuppoints' => [
				'description' => 'Alternative shipping instructions for the courier',
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

	/**
	 * Saves the shipping instructions to the order's metadata.
	 *
	 * @return void
	 */
	private function save_shipping_instructions()
	{

		add_action(
			'woocommerce_store_api_checkout_update_order_from_request',
			function (\WC_Order $order, \WP_REST_Request $request) {
				$smart_send_request_data = $request['extensions'][$this->name];

				$alternate_shipping_instruction = $smart_send_request_data['selectedpickuppoints'];
				$other_shipping_value           = $smart_send_request_data['otherShippingValue'];


				$alternate_shipping_instructionarr = explode('?', $alternate_shipping_instruction);
				$order->update_meta_data('smart_send_alternate_shipping_instruction', $alternate_shipping_instructionarr[1]);

				$order->update_meta_data('ss_shipping_order_agent_no', $alternate_shipping_instructionarr[0]);

				if ('other' === $alternate_shipping_instruction) {
					$order->update_meta_data('smart_send_alternate_shipping_instruction_other_text', $other_shipping_value);
				}
				session_start();
				if (!isset($_SESSION['initialized'])) {
					session_regenerate_id(true);
				}
				$retrive_data = $_SESSION['ss_shipping_agents_blocks'];

				$selected_agent_no = 0;
				if ($retrive_data) {
					foreach ($retrive_data as $agent_key => $agent_value) {
						// If agent selected for the order, save it
						if ($agent_value->agent_no == $alternate_shipping_instructionarr[0]) {

							$selected_agent_no = $agent_value->agent_no;
							$selected_agent = $agent_value;
							$order->update_meta_data('_ss_shipping_order_agent', $selected_agent);

							// $retrive_data = WC()->session->delete( 'ss_shipping_agents' );
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

	/**
	 * Adds the address in the order page in WordPress admin.
	 */
	private function show_shipping_instructions_in_order()
	{
		add_action(
			'woocommerce_admin_order_data_after_shipping_address',
			function (\WC_Order $order) {
				$alternate_shipping_instruction = $order->get_meta('smart_send_alternate_shipping_instruction');

				$ss_shipping_order_agent_no = $order->get_meta('ss_shipping_order_agent_no');
				$alternate_shipping_instruction_other_text = $order->get_meta('smart_send_alternate_shipping_instruction_other_text');

				// $country=$order->data;



				echo '<div>';

				if ('other' === $alternate_shipping_instruction) {
					printf('<p>%s</p>', esc_html($alternate_shipping_instruction_other_text));
				}
				echo '</div>';
			}
		);
	}

	/**
	 * Adds the address on the order confirmation page.
	 */
	private function show_shipping_instructions_in_order_confirmation()
	{
		add_action(
			'woocommerce_thankyou',
			function (int $order_id) {
				$order = wc_get_order($order_id);
				$smart_send_alternate_shipping_instruction            = $order->get_meta('smart_send_alternate_shipping_instruction');
				$smart_send_alternate_shipping_instruction_other_text = $order->get_meta('smart_send_alternate_shipping_instruction_other_text');
				$ss_shipping_order_agent_no = $order->get_meta('ss_shipping_order_agent_no');

				if ('' !== $smart_send_alternate_shipping_instruction) {

					if ('' !== $smart_send_alternate_shipping_instruction_other_text) {
						echo '<p>' . esc_html($smart_send_alternate_shipping_instruction_other_text) . '</p>';
					}
				}
			}
		);
	}

	/**
	 * Adds the address on the order confirmation email.
	 */
	private function show_shipping_instructions_in_order_email()
	{
		add_action(
			'woocommerce_email_after_order_table',
			function ($order, $sent_to_admin, $plain_text, $email) {
				$smart_send_alternate_shipping_instruction            = $order->get_meta('smart_send_alternate_shipping_instruction');
				$smart_send_alternate_shipping_instruction_other_text = $order->get_meta('smart_send_alternate_shipping_instruction_other_text');
				$ss_shipping_order_agent_no = $order->get_meta('ss_shipping_order_agent_no');

				if ('' !== $smart_send_alternate_shipping_instruction) {

					if ('' !== $smart_send_alternate_shipping_instruction_other_text) {
						echo '<p>' . esc_html($smart_send_alternate_shipping_instruction_other_text) . '</p>';
					}
				}
			},
			10,
			4
		);
	}
}
