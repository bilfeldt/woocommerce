<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/******************************** API FUNCTIONS *********************************************/
	function Smartsend_Logistics_API_Call($carrier,$address_1,$address_2,$city,$zip,$country){
		
		$pickup_points = json_decode(Smartsend_Logistics_API_Find_Nearest($carrier,$address_1,$address_2,$city,$zip,$country),true);
					
		$method_style = get_option( 'woocommerce_pickup_display_format', 4 );
		
		$pickup_loc = array();
		if( isset($pickup_points) && is_array($pickup_points) ){
			foreach($pickup_points as $pickup_point) {
				$key_pair = Smartsend_Pickup_Point_Address($pickup_point,$method_style);
									
				$pickup_loc[$key_pair['servicePointId']] = Smartsend_Pickup_Point_Style($key_pair,$method_style);
			}
		}
				   
		return $pickup_loc;
	
	}
	
	function Smartsend_Logistics_wpbo_get_woo_version_number() {
			// If get_plugins() isn't available, require it
		if ( ! function_exists( 'get_plugins' ) )
			require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
	
			// Create the plugins folder and file variables
		$plugin_folder = get_plugins( '/' . 'woocommerce' );
		$plugin_file = 'woocommerce.php';
	
		// If the plugin version number is set, return it 
		if ( isset( $plugin_folder[$plugin_file]['Version'] ) ) {
			return $plugin_folder[$plugin_file]['Version'];

		} else {
		// Otherwise return null
			return NULL;
		}
	}
	
	function Smartsend_Logistics_get_app_version_number() {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
		}
		$plugin_info = get_plugin_data(__DIR__ . '/woocommerce-smartsend-logistics.php', $markup = true, $translate = true );
		
		return $plugin_info["Version"];
	}
	
	function Smartsend_Logistics_API_Find_Nearest($carrier,$address_1,$address_2,$city,$zip,$country) {

        if( !function_exists('curl_version') ) {
            //cURL is not active on the server
            return false;
        }

	    if($carrier == '') {
      		return;
      	} elseif($country == '') {
      		return;
      	} elseif($city == '' && $zip == '') {
      		return;
      	}
	
		$url = "https://app.smartsend.dk/pickup/";
		$url .= $carrier.'?'.http_build_query(array(
			'street' 		=> $address_1.($address_2 =! '' ? ' ' : '').$address_2,
			'city' 			=> $city,
			'zip' 			=> $zip, 
			'country' 		=> $country)
			);
		/**
		* Post the response using CURL
		**/
		$ch = curl_init();    
		curl_setopt($ch, CURLOPT_URL, $url); //curl url
		curl_setopt($ch, CURLOPT_HTTPGET, true); //curl request method
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,2); // - Number of seconds to wait while trying to connect. 0 means infinity.
        curl_setopt($ch, CURLOPT_TIMEOUT, 6); //timeout in seconds
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        	'apikey:N5egWgckXdb4NhV3bTzCAKB26ou73nJm',
        	'smartsendmail:'.get_option( 'smartsend_logistics_username', '' ),
        	'smartsendlicence:'.get_option( 'smartsend_logistics_licencekey', '' ),
        	'cmssystem:WooCommerce',
        	'cmsversion:'.Smartsend_Logistics_wpbo_get_woo_version_number(),
        	'appversion:'.Smartsend_Logistics_get_app_version_number(),
        	'test:false',
        	//'Content-Type:application/json; charset=UTF-8', //THIS LINE CAUSES AN ERROR
        	"Accept: text/xml",
        	'Accept-Language:'.str_replace("_","-",get_locale()),
			)); 

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$result = new StdClass();
		$result->response = curl_exec($ch);           //exceute curl
		$result->code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$result->meta = curl_getinfo($ch);
		$curl_error = ($result->code > 0 ? null : curl_error($ch) . ' (' . curl_errno($ch) . ')');               //getting error from curl if any

		curl_close($ch);               //close curl

		if ($curl_error) {
			//throw new Exception('An error occurred while connecting to Smartsend Api: ' . $curl_error);
			return false;
		}
		
		if($result->code == 200) {
			return $result->response;
		} else {
			return false;
		}
		
	}
	
	function Smartsend_Pickup_Point_Style($pickarray,$style_type){
		if(is_array($pickarray)){
			switch ($style_type){
				CASE '1':
					$dropdown = $pickarray['company'].', '.$pickarray['street']; 
				BREAK;
				CASE '2':
					$dropdown = $pickarray['company'].', '.$pickarray['street'].', '.$pickarray['zip']; 
				BREAK;
				CASE '3':
					$dropdown = $pickarray['company'].', '.$pickarray['street'].', '.$pickarray['city']; 
				BREAK;
				CASE '4':
					$dropdown = $pickarray['company'].', '.$pickarray['street'].', '.$pickarray['zip'].' '.$pickarray['city']; 
				BREAK;
				CASE '5':
					$dropdown = $pickarray['company'].', '.$pickarray['street'].', '.$pickarray['zip'].' '.$pickarray['city'].' ('.$pickarray['type'].')'; 
				BREAK;
			}
		}
		return $dropdown;
	}
			
	function Smartsend_Pickup_Point_Address($servicePoint,$method_style) {
		
		$data['pick_up_id'] 		= $servicePoint['pickupid'];
		$data['id'] 				= $servicePoint['pickupid'];
		$data['company'] 			= implode(" ", array_filter(array($servicePoint['name1'], $servicePoint['name2'])));        //joining the address data 
		$data['street'] 			= implode(" ", array_filter(array($servicePoint['address1'], $servicePoint['address2'])));
		$data['zip'] 				= $servicePoint['zip'];
		$data['city'] 				= $servicePoint['city'];
		$data['country'] 			= $servicePoint['country'];
		
		$data['shippingMethod'] 	= $servicePoint['carrier'];
		$data['type'] 				= $servicePoint['carrier'];
		$data['method_style'] 		= $method_style;
		
		$ser = serialize($data);
		$data['servicePointId'] = $ser;
		return $data;
	}
	
    function Smartsend_User_Validation($username,$licensekey) {
    
    	if($username == '' || $licensekey == '') {
    		return false;
    	}
    
		$ch = curl_init();

        /* Script URL */
        $url = 'https://app.smartsend.dk/verify_user';

        curl_setopt($ch, CURLOPT_URL, $url);               //curl url
        curl_setopt($ch, CURLOPT_HTTPGET, true);               //curl request method
        //curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        	'apikey:yL18TETUVQ7E9pgVb6JeV1erIYHAMcwe',
        	'smartsendmail:'.$username,
        	'smartsendlicence:'.$licensekey,
        	'cmssystem:WooCommerce',
        	'cmsversion:'.Smartsend_Logistics_wpbo_get_woo_version_number(),
        	'appversion:'.Smartsend_Logistics_get_app_version_number(),
        	));    //curl request header
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = new StdClass();
        $result->response = curl_exec($ch);                  //executing curl
        $result->code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $result->meta = curl_getinfo($ch);
        curl_close($ch);               //curl closing
        
        if($result->code == 200) {
			return true;
        } else {
            return false;
        }         
	}
	
/********************************END OF API FUNCTIONS *********************************************/