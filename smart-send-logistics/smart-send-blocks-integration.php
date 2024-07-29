<?php

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;

/**
 * Class for integrating with WooCommerce Blocks
 */
class Smart_Send_Blocks_Integration implements IntegrationInterface
{

	/**
	 * The name of the integration.
	 *
	 * @return string
	 */
	public function get_name()
	{
		return 'smart-send-logistics';
	}

	/**
	 * When called invokes any initialization/setup for the integration.
	 */
	public function initialize()
	{
		require_once __DIR__ . '/smart-send-extend-store-endpoint.php';
		$this->register_smart_send_block_frontend_scripts();
		$this->register_smart_send_block_editor_scripts();
		$this->register_smart_send_block_editor_styles();
		$this->register_main_integration();
		$this->extend_store_api();
		$this->save_shipping_instructions();
	}

	/**
	 * Extends the cart schema to include the smart-send value.
	 */
	private function extend_store_api()
	{
		Smart_Send_Extend_Store_Endpoint::init();
	}

	private function save_shipping_instructions()
	{

		add_action(
			'woocommerce_store_api_checkout_update_order_from_request',
			function (\WC_Order $order, \WP_REST_Request $request) {
				$smart_send_request_data = $request['extensions'][$this->get_name()];

				$pickup_points = $smart_send_request_data['selectedpickuppoints'];

				$order->update_meta_data('ss_shipping_order_agent_no', $pickup_points);

				$order->save();
			},
			10,
			2
		);
	}






	/**
	 * Registers the main JS file required to add filters and Slot/Fills.
	 */
	private function register_main_integration()
	{
		$script_path = '/build/index.js';
		$style_path  = '/build/style-index.css';

		$script_url = plugins_url($script_path, __FILE__);
		$style_url  = plugins_url($style_path, __FILE__);

		$script_asset_path = dirname(__FILE__) . '/build/index.asset.php';
		$script_asset      = file_exists($script_asset_path)
			? require $script_asset_path
			: [
				'dependencies' => [],
				'version'      => $this->get_file_version($script_path),
			];

		wp_enqueue_style(
			'smart-send-blocks-integration',
			$style_url,
			[],
			$this->get_file_version($style_path)
		);

		wp_register_script(
			'smart-send-blocks-integration',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);
		wp_set_script_translations(
			'smart-send-blocks-integration',
			'smart-send-logistics',
			dirname(__FILE__) . '/languages'
		);
	}

	/**
	 * Returns an array of script handles to enqueue in the frontend context.
	 *
	 * @return string[]
	 */
	public function get_script_handles()
	{
		return ['smart-send-blocks-integration', 'smart-send-block-frontend'];
	}

	/**
	 * Returns an array of script handles to enqueue in the editor context.
	 *
	 * @return string[]
	 */
	public function get_editor_script_handles()
	{
		return ['smart-send-blocks-integration', 'smart-send-block-editor'];
	}

	/**
	 * An array of key, value pairs of data made available to the block on the client side.
	 *
	 * @return array
	 */
	public function get_script_data()
	{
		$data = [
			'smart-send-active' => true,
		];

		return $data;
	}

	public function register_smart_send_block_editor_styles()
	{
		$style_path = '/build/style-smart-send-block.css';

		$style_url = plugins_url($style_path, __FILE__);
		wp_enqueue_style(
			'smart-send-block',
			$style_url,
			[],
			$this->get_file_version($style_path)
		);
	}

	public function register_smart_send_block_editor_scripts()
	{
		$script_path       = '/build/smart-send-block.js';
		$script_url        = plugins_url($script_path, __FILE__);
		$script_asset_path = dirname(__FILE__) . '/build/smart-send-block.asset.php';
		$script_asset      = file_exists($script_asset_path)
			? require $script_asset_path
			: [
				'dependencies' => [],
				'version'      => $this->get_file_version($script_asset_path),
			];

		wp_register_script(
			'smart-send-block-editor',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		wp_set_script_translations(
			'smart-send-block-editor',
			'smart-send-logistics',
			dirname(__FILE__) . '/languages'
		);
	}

	public function register_smart_send_block_frontend_scripts()
	{
		$script_path       = '/build/smart-send-block-frontend.js';
		$script_url        = plugins_url($script_path, __FILE__);
		$script_asset_path = dirname(__FILE__) . '/build/smart-send-block-frontend.asset.php';
		$script_asset      = file_exists($script_asset_path)
			? require $script_asset_path
			: [
				'dependencies' => [],
				'version'      => $this->get_file_version($script_asset_path),
			];

		wp_register_script(
			'smart-send-block-frontend',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);
		wp_set_script_translations(
			'smart-send-block-frontend',
			'smart-send-logistics',
			dirname(__FILE__) . '/languages'
		);
	}

	/**
	 * Get the file modified time as a cache buster if we're in dev mode.
	 *
	 * @param string $file Local path to the file.
	 * @return string The cache buster value to use for the given file.
	 */
	protected function get_file_version($file)
	{
		if (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG && file_exists($file)) {
			return filemtime($file);
		}
		return SMART_SEND_VERSION;
	}
}
