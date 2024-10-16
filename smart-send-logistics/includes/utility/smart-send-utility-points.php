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
}
