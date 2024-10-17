<?php

/**
 * WooCommerce Smart Send  Points Utility.
 *
 * @package  SS_Shipping_Utility_Points
 * @category Utility Points
 * @author   Smart Send
 */

class Smart_Send_Utility_Points
{
    /**
     * Check if the provided shipping method is a Smart Send shipping method.
     *
     * @param string $name
     * @return boolean
     */
    public static function is_smart_send_shipping_method(string $name)
    {
        if ($name == 'smart_send_shipping') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if the provided shipping method is a pickup point method.
     *
     * @param string $name
     * @return boolean
     */
    public static function is_pickup_point_method(string $name)
    {
        if (stripos($name, 'agent') !== false) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * Find the closest agents by address
     *
     * @param $carrier string | unique carrier code
     * @param $country string | ISO3166-A2 Country code
     * @param $postal_code string
     * @param $city string
     * @param $street string
     *
     * @return array
     */
    public static function find_closest_agents_by_address($carrier, $country, $postal_code, $city, $street)
    {
        SS_SHIPPING_WC()->log_msg('Called "findClosestAgentByAddress" for website ' . SS_SHIPPING_WC()->get_website_url() . ' with carrier = "' . $carrier . '", country = "' . $country . '", postcode = "' . $postal_code . '", city = "' . $city . '", street = "' . $street . '"');

        if (SS_SHIPPING_WC()->get_api_handle()->findClosestAgentByAddress($carrier, $country, $postal_code, $street, $city)) {

            $ss_agents = SS_SHIPPING_WC()->get_api_handle()->getData();

            SS_SHIPPING_WC()->log_msg('Response from "findClosestAgentByAddress": ' . SS_SHIPPING_WC()->get_api_handle()->getResponseBody());

            return $ss_agents;
        } else {
            SS_SHIPPING_WC()->log_msg('Response from "findClosestAgentByAddress": ' . SS_SHIPPING_WC()->get_api_handle()->getErrorString());

            return array();
        }
    }
}
