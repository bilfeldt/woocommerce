<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include '../../pickup-point-block/smart-send-utility-session.php';
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
     * @var FrontendInterface $frontend An instance of the frontend class handling agent fetching and session management.
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
        register_rest_route('smart-send-logistics/v1', '/get-closest-pickup-points', array(
            'methods' => 'POST',
            'callback' => array($this, 'get_pickup_points_callback'),
            'permission_callback' => "__return_true",
        ));
        // Register the API endpoint for shipping carrier
        register_rest_route('smart-send-logistics/v1', '/get-shipping-carrier', array(
            'methods' => 'POST',
            'callback' => array($this, 'get_shipping_carrier'),
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
        $carrier = wc_clean($request->get_param('carrier'));
        $is_rest_api = true;

        $ss_agents = $this->frontend->handle_agents_session($carrier, $country, $postal_code, $city, $street, $is_rest_api);
        if (!empty($ss_agents)) {
            $ss_agent_options = array();
            foreach ($ss_agents as $key => $agent) {
                $formatted_address = $this->frontend->get_formatted_address_for_endpoint($agent);
                $ss_agent_options[$agent->agent_no] = $formatted_address;
            }


            return new WP_REST_Response($ss_agent_options, 200);
        } else {
            return new WP_REST_Response(array('message' => __('No pick-up points found', 'smart-send-logistics')), 404);
        }
    }

    /**
     * Get shipping method meta data
     */
    public function get_shipping_carrier(WP_REST_Request $request)
    {
        // Get the shipping method value from the request
        $shipping_method = wc_clean($request->get_param('ss_method'));
        if (empty($shipping_method)) {
            return new WP_REST_Response(array('message' => __('Invalid Shipping Method ID', 'smart-send-logistics')), 400);
        }

        $carrier_keys = ["name", "id"];

        $shipping_method_parts = explode(":", $shipping_method);

        if (count($shipping_method_parts) > 1) {
            // Get the second part of the shipping method which is the ID
            $shipping_method_parts = array_combine($carrier_keys, $shipping_method_parts);
        }

        $shipping_method_id = $shipping_method_parts["id"];

        // Retrieve the shipping method instance by its ID
        $shipping_method_instance = WC_Shipping_Zones::get_shipping_method($shipping_method_id);
        if (!$shipping_method_instance) {
            return new WP_REST_Response(array('message' => __('No Shipping Method found', 'smart-send-logistics')), 404);
        }
        $options = get_option('woocommerce_' . $shipping_method_instance->id . '_' . $shipping_method_instance->instance_id . '_settings');
        $shipping_agent = $options['method'];
        $shipping_agent = explode("_", $shipping_agent);
        $shipping_carrier_info=[
            'id' => $shipping_method_id,
            'carrier' => $shipping_agent[0],
            'method' => $options['method'],
            'show_pickup_selector' => true,
            'default_first_pickup_point' => false
        ];
        return new WP_REST_Response($shipping_carrier_info, 200);
    }
}
