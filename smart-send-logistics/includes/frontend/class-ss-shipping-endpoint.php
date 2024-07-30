<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class SS_Shipping_Endpoint
{
    protected $frontend;

    public function __construct($frontends)
    {
        $this->frontend = $frontends;

        add_action('rest_api_init', array($this, 'register_endpoints'));
    }

    public function register_endpoints()
    {
        // register the api end-point
        register_rest_route('smart-send-logistics/v1', '/get-closest-pickup-points', array(
            'methods' => 'POST',
            'callback' => array($this, 'get_pickup_points_callback'),
            'permission_callback' => "__return_true",
        ));
    }

    public function get_pickup_points_callback(WP_REST_Request $request)
    {
        $country = wc_clean($request->get_param('country'));
        $postal_code = wc_clean($request->get_param('postCode'));
        $city = (!empty($request->get_param('city')) ? wc_clean($request->get_param('city')) : null);
        $street = wc_clean($request->get_param('street'));
        $meta_data = wc_clean($request->get_param('meta_data'));

        $carrier = 'gls';
        $is_rest_api = 'yes';

        $ss_agents = $this->frontend->find_closest_agents_by_address($carrier, $country, $postal_code, $city, $street, $is_rest_api);
        if (!empty($ss_agents)) {
            $ss_agent_options = array();
            $ss_setting = SS_SHIPPING_WC()->get_ss_shipping_settings();

            if (!isset($ss_setting['default_select_agent']) || $ss_setting['default_select_agent'] == 'no') {
                $ss_agent_options[0] = __('- Select Pick-up Point -', 'smart-send-logistics');
            }
            foreach ($ss_agents as $key => $agent) {
                $formatted_address = $this->frontend->get_formatted_address_for_endpoint($agent);
                $ss_agent_options[$agent->agent_no] = $formatted_address;
            }
            return new WP_REST_Response($ss_agent_options, 200);
        } else {
            return new WP_REST_Response(array('message' => __('No pick-up points found', 'smart-send-logistics')), 404);
        }
    }
}
