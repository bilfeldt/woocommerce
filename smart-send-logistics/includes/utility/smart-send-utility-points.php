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
     * function to check whether current id is smartsend shipping
     * @param int $id
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
