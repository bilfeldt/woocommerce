/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/smart-send-block/block.js":
/*!******************************************!*\
  !*** ./src/js/smart-send-block/block.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Block: () => (/* binding */ Block)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./options */ "./src/js/smart-send-block/options.js");
/* harmony import */ var _countries__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./countries */ "./src/js/smart-send-block/countries.js");

/**
 * External dependencies
 */






/**
 * Internal dependencies
 */


const Block = ({
  checkoutExtensionData,
  extensions
}) => {
  const isCalculating = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    const store = select('wc/store/checkout');
    return store.isCalculating();
  });
  const {
    setExtensionData
  } = checkoutExtensionData;
  const debouncedSetExtensionData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)((0,lodash__WEBPACK_IMPORTED_MODULE_5__.debounce)((namespace, key, value) => {
    setExtensionData(namespace, key, value);
  }, 1000), [setExtensionData]);
  const validationErrorId = 'smart-send-other-value';
  const [availablePickupPoints, setavailablePickupPoints] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const {
    setValidationErrors,
    clearValidationError
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)('wc/store/validation');
  const validationError = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    const store = select('wc/store/validation');
    return store.getValidationError(validationErrorId);
  });
  const [selectedPickupPoint, setselectedPickupPoint] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('try-again');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    var street = setValue('shipping-address_1');
    var city = setValue('shipping-city');
    var country = setValue('components-form-token-input-0');
    country = _countries__WEBPACK_IMPORTED_MODULE_7__.countries[country];
    var postcode = setValue('shipping-postcode');
    var selected = jQuery('.wc-block-components-shipping-rates-control').find('input[type=radio]:checked').val();
    const fetchPickupPoint = async () => {
      if (isCalculating) {
        if (postcode && street && city && country) {
          const pickupPoints = await findClosestAgentByAddress(selected, country, postcode, city, street);
          if (pickupPoints.length > 0) {
            const pickupDefaultValue = pickupPoints[0];
            setavailablePickupPoints(pickupPoints);
            setselectedPickupPoint(pickupDefaultValue);
          }
        }
      }
    };
    fetchPickupPoint();
  }, [isCalculating]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setExtensionData('smart-send-logistics', 'selectedPickupPoint', selectedPickupPoint);
  }, [setExtensionData, selectedPickupPoint]);
  const [hasInteractedWithOtherInput, setHasInteractedWithOtherInput] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (setselectedPickupPoint !== 'other') {
      if (validationError) {
        clearValidationError(validationErrorId);
      }
      return;
    }
    setValidationErrors({
      [validationErrorId]: {
        message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Please select a valid pickup point', 'smart-send-logistics'),
        hidden: !hasInteractedWithOtherInput
      }
    });
  }, [clearValidationError, setselectedPickupPoint, setValidationErrors, validationErrorId, debouncedSetExtensionData, validationError]);
  const handlePickupPointChange = agentNo => {
    const selectedPoint = availablePickupPoints.find(pickupPoint => pickupPoint.agent_no === agentNo);
    if (selectedPoint) {
      setselectedPickupPoint(selectedPoint);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wp-block-smart-send-pickup-points"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Select pick-up point', 'smart-send-logistics'),
    value: selectedPickupPoint['agent_no'],
    options: _options__WEBPACK_IMPORTED_MODULE_6__.options,
    onChange: handlePickupPointChange,
    className: "select_ss_pickup_point"
  }));
};

// Function to find closest agent by address
async function findClosestAgentByAddress(ss_agent, country, postalCode, city, street) {
  country = country;
  postalCode = postalCode;
  city = city;
  street = street;
  var carrier = await getShippingCarrier(ss_agent);
  var defaultvalue = getPickupPoints(carrier, country, postalCode, city, street);
  return defaultvalue;
}
function setValue(id) {
  var element = document.getElementById(id);
  if (element) {
    return element.value;
  }
  return null;
}
const getPickupPoints = async (carrier, country, postalCode, city, street) => {
  const url = '/wp-json/smart-send-logistics/v1/get-closest-pickup-points'; // Custom endpoint registered by this package

  const data = {
    country: country,
    postCode: postalCode,
    city: city,
    street: street,
    carrier: carrier
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      jQuery('.select_ss_pickup_point').hide();
      jQuery('.select_ss_pickup_point').css('opacity', 0);
      return [];
    } else {
      const pickupPoints = await response.json();
      if (Array.isArray(pickupPoints)) {
        let pickupOptionsHTML = '';
        pickupPoints.forEach(pickupPoint => {
          const agentAddress = formatAgentAddress(pickupPoint);
          pickupOptionsHTML += `<option value="${pickupPoint.agent_no}">${agentAddress}</option>`;
        });
        jQuery('.select_ss_pickup_point').find('select').html(pickupOptionsHTML);
        getSelectedShippingMethod();
      } else {
        return [];
      }
      return pickupPoints;
    }
  } catch (error) {
    alert('Failed to fetch pick-up points');
  }
};
function getSelectedShippingMethod() {
  var selected = jQuery('.wc-block-components-shipping-rates-control').find('input[type=radio]:checked').val();
  if (selected.indexOf('smart_send') !== -1) {
    jQuery('.select_ss_pickup_point').show();
    jQuery('.select_ss_pickup_point').css('opacity', 1);
    return selected;
  } else {
    jQuery('.select_ss_pickup_point').hide();
    jQuery('.select_ss_pickup_point').css('opacity', 0);
  }
}
const getShippingCarrier = async shipping_method => {
  const url = '/wp-json/smart-send-logistics/v1/get-shipping-carrier'; // Custom endpoint registered by this package

  const data = {
    ss_method: shipping_method
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
    } else {
      const results = await response.json();
      return results.carrier;
    }
  } catch (error) {
    alert('Failed to fetch Shipping Carrier');
  }
};
function formatAgentAddress(pickupPoint) {
  const distance = parseFloat(pickupPoint.distance); // Parse once and reuse
  const formattedDistance = distance >= 1 ? distance.toFixed(2) + ' km' : Math.round(distance * 1000) + ' m'; // Renamed to reflect it's formatted

  return `${formattedDistance}: ${pickupPoint.company} ${pickupPoint.address_line1} ${pickupPoint.postal_code} ${pickupPoint.city}`;
}

/***/ }),

/***/ "./src/js/smart-send-block/countries.js":
/*!**********************************************!*\
  !*** ./src/js/smart-send-block/countries.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   countries: () => (/* binding */ countries)
/* harmony export */ });
const countries = {
  'Afghanistan': 'AF',
  'Albania': 'AL',
  'Algeria': 'DZ',
  'American Samoa': 'AS',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Anguilla': 'AI',
  'Antarctica': 'AQ',
  'Antigua and Barbuda': 'AG',
  'Argentina': 'AR',
  'Armenia': 'AM',
  'Aruba': 'AW',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bermuda': 'BM',
  'Bhutan': 'BT',
  'Bolivia, Plurinational State of': 'BO',
  'Bonaire, Sint Eustatius and Saba': 'BQ',
  'Bosnia and Herzegovina': 'BA',
  'Botswana': 'BW',
  'Bouvet Island': 'BV',
  'Brazil': 'BR',
  'British Indian Ocean Territory': 'IO',
  'Brunei Darussalam': 'BN',
  'Bulgaria': 'BG',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  'Cambodia': 'KH',
  'Cameroon': 'CM',
  'Canada': 'CA',
  'Cape Verde': 'CV',
  'Cayman Islands': 'KY',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  'Christmas Island': 'CX',
  'Cocos (Keeling) Islands': 'CC',
  'Colombia': 'CO',
  'Comoros': 'KM',
  'Congo': 'CG',
  'Congo, the Democratic Republic of the': 'CD',
  'Cook Islands': 'CK',
  'Costa Rica': 'CR',
  'Croatia': 'HR',
  'Cuba': 'CU',
  'Curaçao': 'CW',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  "Côte d'Ivoire": 'CI',
  'Denmark': 'DK',
  'Djibouti': 'DJ',
  'Dominica': 'DM',
  'Dominican Republic': 'DO',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'El Salvador': 'SV',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Ethiopia': 'ET',
  'Falkland Islands (Malvinas)': 'FK',
  'Faroe Islands': 'FO',
  'Fiji': 'FJ',
  'Finland': 'FI',
  'France': 'FR',
  'French Guiana': 'GF',
  'French Polynesia': 'PF',
  'French Southern Territories': 'TF',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Ghana': 'GH',
  'Gibraltar': 'GI',
  'Greece': 'GR',
  'Greenland': 'GL',
  'Grenada': 'GD',
  'Guadeloupe': 'GP',
  'Guam': 'GU',
  'Guatemala': 'GT',
  'Guernsey': 'GG',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Heard Island and McDonald Islands': 'HM',
  'Holy See (Vatican City State)': 'VA',
  'Honduras': 'HN',
  'Hong Kong': 'HK',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'India': 'IN',
  'Indonesia': 'ID',
  'Iran, Islamic Republic of': 'IR',
  'Iraq': 'IQ',
  'Ireland': 'IE',
  'Isle of Man': 'IM',
  'Israel': 'IL',
  'Italy': 'IT',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Jersey': 'JE',
  'Jordan': 'JO',
  'Kazakhstan': 'KZ',
  'Kenya': 'KE',
  'Kiribati': 'KI',
  "Korea, Democratic People's Republic of": 'KP',
  'Korea, Republic of': 'KR',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  "Lao People's Democratic Republic": 'LA',
  'Latvia': 'LV',
  'Lebanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Macao': 'MO',
  'Macedonia, the former Yugoslav Republic of': 'MK',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Martinique': 'MQ',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Mayotte': 'YT',
  'Mexico': 'MX',
  'Micronesia, Federated States of': 'FM',
  'Moldova, Republic of': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Montenegro': 'ME',
  'Montserrat': 'MS',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Myanmar': 'MM',
  'Namibia': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'New Caledonia': 'NC',
  'New Zealand': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'Niue': 'NU',
  'Norfolk Island': 'NF',
  'Northern Mariana Islands': 'MP',
  'Norway': 'NO',
  'Oman': 'OM',
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Palestine, State of': 'PS',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Pitcairn': 'PN',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Puerto Rico': 'PR',
  'Qatar': 'QA',
  'Romania': 'RO',
  'Russian Federation': 'RU',
  'Rwanda': 'RW',
  'Réunion': 'RE',
  'Saint Barthélemy': 'BL',
  'Saint Helena, Ascension and Tristan da Cunha': 'SH',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Martin (French part)': 'MF',
  'Saint Pierre and Miquelon': 'PM',
  'Saint Vincent and the Grenadines': 'VC',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Sint Maarten (Dutch part)': 'SX',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Solomon Islands': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'South Georgia and the South Sandwich Islands': 'GS',
  'South Sudan': 'SS',
  'Spain': 'ES',
  'Sri Lanka': 'LK',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Svalbard and Jan Mayen': 'SJ',
  'Swaziland': 'SZ',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Syrian Arab Republic': 'SY',
  'Taiwan, Province of China': 'TW',
  'Tajikistan': 'TJ',
  'Tanzania, United Republic of': 'TZ',
  'Thailand': 'TH',
  'Timor-Leste': 'TL',
  'Togo': 'TG',
  'Tokelau': 'TK',
  'Tonga': 'TO',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkey': 'TR',
  'Turkmenistan': 'TM',
  'Turks and Caicos Islands': 'TC',
  'Tuvalu': 'TV',
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  'United States Minor Outlying Islands': 'UM',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Vanuatu': 'VU',
  'Venezuela, Bolivarian Republic of': 'VE',
  'Viet Nam': 'VN',
  'Virgin Islands, British': 'VG',
  'Virgin Islands, U.S.': 'VI',
  'Wallis and Futuna': 'WF',
  'Western Sahara': 'EH',
  'Yemen': 'YE',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
  'Åland Islands': 'AX'
};

/***/ }),

/***/ "./src/js/smart-send-block/options.js":
/*!********************************************!*\
  !*** ./src/js/smart-send-block/options.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   options: () => (/* binding */ options)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/**
 * External dependencies
 */

const options = [{
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select pickup point', 'smart-send-logistics'),
  value: 'select-pickup-point'
}];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

module.exports = window["lodash"];

/***/ }),

/***/ "@woocommerce/blocks-checkout":
/*!****************************************!*\
  !*** external ["wc","blocksCheckout"] ***!
  \****************************************/
/***/ ((module) => {

module.exports = window["wc"]["blocksCheckout"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./src/js/smart-send-block/block.json":
/*!********************************************!*\
  !*** ./src/js/smart-send-block/block.json ***!
  \********************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"apiVersion":3,"name":"smart-send/pickup-point-block","version":"2.0.0","title":"Smart Send logistics Pickup Points","category":"woocommerce","description":"Show pick-up point selector during checkout for relevant shipping methods","supports":{"html":false,"align":false,"multiple":false,"reusable":false},"parent":["woocommerce/checkout-shipping-methods-block"],"attributes":{"lock":{"type":"object","default":{"remove":true,"move":true}},"text":{"type":"string","default":""}},"textdomain":"smart-send-logistics","editorStyle":"file:../../../build/style-smart-send-block.css"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*********************************************!*\
  !*** ./src/js/smart-send-block/frontend.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @woocommerce/blocks-checkout */ "@woocommerce/blocks-checkout");
/* harmony import */ var _woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _block__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block */ "./src/js/smart-send-block/block.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./block.json */ "./src/js/smart-send-block/block.json");
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */


(0,_woocommerce_blocks_checkout__WEBPACK_IMPORTED_MODULE_0__.registerCheckoutBlock)({
  metadata: _block_json__WEBPACK_IMPORTED_MODULE_2__,
  component: _block__WEBPACK_IMPORTED_MODULE_1__.Block
});
/******/ })()
;
//# sourceMappingURL=smart-send-block-frontend.js.map