<?php

/**
 * WooCommerce Smart Send  Session.
 *
 * @package  SS_Shipping_Utility_Session
 * @category Session
 * @author   Smart Send
 */

class Smart_Send_Utility_Session
{
    public static function initialize()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['initialized'])) {
            session_regenerate_id(true);
            $_SESSION['initialized'] = true;
        }
    }
}
