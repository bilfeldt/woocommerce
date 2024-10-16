<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include SS_SHIPPING_PLUGIN_DIR_PATH . '/includes/utility/smart-send-utility-points.php';

/**
 * Class SS_Shipping_Api_Endpoint
 *
 * Handles the REST API endpoints for Smart Send Logistics.
 *
 * This class is responsible for registering the REST API endpoints and handling
 * requests to fetch the closest pickup points based on provided address parameters.
 *
 * @package    SmartSendLogistics
 * @subpackage SS_Shipping_Endpoint
 * @category   REST API
 * @author     Smart Send
 */
class SS_Shipping_Api_Endpoint
{

    /**
     * @var SS_Shipping_Frontend $frontend For an instance of the frontend class handling agent fetching.
     */
    protected $frontend;

    /**
     * SS_Shipping_Endpoint constructor.
     *
     * @param SS_Shipping_Frontend $frontends An instance of a class implementing the frontend logic.
     */
    public function __construct(SS_Shipping_Frontend $frontends)
    {
        $this->frontend = $frontends;
        add_action('rest_api_init', array($this, 'register_endpoints'));
    }

    /**
     * Registers the custom REST API endpoint for fetching closest pickup points.
     *
     * @return void
     */
    public function register_endpoints()
    {
        // Register the API endpoint
        register_rest_route('smart-send-logistics/v1', '/checkout/shipping', array(
            'methods' => 'POST',
            'callback' => array($this, 'get_pickup_points_callback'),
            'permission_callback' => "__return_true",
        ));
    }

    /**
     * Callback function for the REST API endpoint to fetch pickup points.
     *
     * @param WP_REST_Request $request The request object containing parameters.
     * @return WP_REST_Response Response object with pickup points or an error message.
     */
    public function get_pickup_points_callback(WP_REST_Request $request)
    {
        $country = wc_clean($request->get_param('country'));
        $postal_code = wc_clean($request->get_param('postCode'));
        $city = (!empty($request->get_param('city')) ? wc_clean($request->get_param('city')) : null);
        $street = wc_clean($request->get_param('street'));
        $shipping_method = wc_clean($request->get_param('shipping_method'));
        // to get the shipping carrier info
        $shipping_carrier_info = $this->get_shipping_carrier($shipping_method);
        $carrier = $shipping_carrier_info['carrier'];

        // to fetch the closest pickup points
        $ss_agents = $this->frontend->find_closest_agents_by_address($carrier, $country, $postal_code, $city, $street);
        if (!empty($ss_agents)) {
            $ss_agent_options = array();
            foreach ($ss_agents as $key => $agent) {
                $formatted_address = $this->frontend->get_formatted_address_for_endpoint($agent);

                $ss_agent_options[$agent->agent_no] = $formatted_address;
            }

            $is_pickup = $shipping_carrier_info['is_pickup'];
            $default_pickup = $shipping_carrier_info['default_first_pickup_point'];

            $resulted_array = array(
                "id" => $shipping_method,
                "is_pickup" => $is_pickup,
                "default_pickup" => $default_pickup,
                "pickup_points" => $ss_agents
            );

            return new WP_REST_Response($resulted_array, 200);
        } else {
            return new WP_REST_Response(array('message' => __("No pick-up points found $carrier", 'smart-send-logistics')), 404);
        }
    }

    /**
     * Get shipping method meta data
     */
    public function get_shipping_carrier($shipping_method)
    {
        // Get the shipping method value from the request

        $carrier_keys = ["name", "id"];

        $shipping_method_parts = explode(":", $shipping_method);

        if (count($shipping_method_parts) > 1) {
            // Get the second part of the shipping method which is the ID
            $shipping_method_parts = array_combine($carrier_keys, $shipping_method_parts);
        }
        $shipping_method_id = $shipping_method_parts["id"];

        // Retrieve the shipping method instance by its ID
        // $shipping_method_instance = WC_Shipping_Zones::get_shipping_method($shipping_method_id);

        $shipping_carrier_info = $this->get_shipping_method_meta_data($shipping_method_id);
        return $shipping_carrier_info;
    }

    /**
     * Get shipping method meta data.
     * 
     * This function retrieves meta data for a specific shipping method
     * based on the shipping method ID. It gathers details such as the
     * shipping carrier, method, and whether to show  pickup points or not .
     * 
     * @param string $shipping_method_id Shipping method ID.
     * @return array Shipping method meta data.
     */
    private function get_shipping_method_meta_data($shipping_method_id)
    {
        // Get the shipping method instance based on the shipping method ID
        $shipping_method_instance = WC_Shipping_Zones::get_shipping_method($shipping_method_id);

        // Retrieve the options/settings for the specific shipping method instance
        $options = get_option('woocommerce_' . $shipping_method_instance->id . '_' . $shipping_method_instance->instance_id . '_settings');

        // Get the shipping agent method from the settings (e.g., method code like 'carrier_method')
        $shipping_agent = $options['method'];

        // Split the shipping agent method to get the carrier information (e.g., 'carrier_method' -> ['carrier', 'method'])
        $shipping_agent_carrier = explode("_", $shipping_agent);

        // Retrieve Smart Send shipping settings
        $ss_setting = SS_SHIPPING_WC()->get_ss_shipping_settings();

        // Get the default pickup point setting from Smart Send shipping settings
        $default_select_agent = $ss_setting['default_select_agent'];

        // Check if the to show the pickup points or not
        $is_pickup = is_string($shipping_agent) ? Smart_Send_Utility_Points::is_pickup_point_method($shipping_agent) : false;

        // Create an array with the shipping carrier information
        $shipping_carrier_info = [
            'id' => $shipping_method_id,                    // Shipping method ID
            'carrier' => $shipping_agent_carrier[0],        // Carrier (e.g., 'carrier')
            'method' => $options['method'],                 // Method (e.g., 'carrier_method')
            'is_pickup' => $is_pickup,                      // Boolean indicating if it's a pickup point method
            'default_first_pickup_point' => $default_select_agent // Default selected pickup point
        ];

        // Return the shipping carrier information array
        return $shipping_carrier_info;
    }
}
