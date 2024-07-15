/**
 * External dependencies
 */
import { useEffect, useState, useCallback } from "@wordpress/element";
import { SelectControl, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { debounce, join } from "lodash";

/**
 * Internal dependencies
 */
import { options } from "./options";
import { countries } from "./countries";

export const Block = ({ checkoutExtensionData, extensions }) => {
  const isCalculating = useSelect((select) => {
    const store = select("wc/store/checkout");
    return store.isCalculating();
  });
  const { setExtensionData } = checkoutExtensionData;
  /**
   * Debounce the setExtensionData function to avoid multiple calls to the API when rapidly
   * changing options.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetExtensionData = useCallback(
    debounce((namespace, key, value) => {
      setExtensionData(namespace, key, value);
    }, 1000),
    [setExtensionData]
  );

  const validationErrorId = "shipping-workshop-other-value";

  const { setValidationErrors, clearValidationError } = useDispatch(
    "wc/store/validation"
  );
  const validationError = useSelect((select) => {
    const store = select("wc/store/validation");
    /**
     * [frontend-step-07]
     * 📝 Write some code to get the validation error from the `wc/store/validation` data store.
     * Using the `getValidationError` selector on the `store` object, get the validation error.
     *
     * The `validationErrorId` variable can be used to get the validation error. Documentation
     * on the validation data store can be found here:
     * https://github.com/woocommerce/woocommerce-blocks/blob/trunk/docs/third-party-developers/extensibility/data-store/validation.md
     */
    return store.getValidationError(validationErrorId);

  });
  const [
    selectedpickuppoints,
    setSelectedpickuppoints,
  ] = useState("try-again");
  useEffect(() => {
    var carrier = "postnord";
    var street = setValue("shipping-address_1");
    var city = setValue("shipping-city");
    // var state = document.getElementById( 'shipping-state' ).value;
    var country = setValue("components-form-token-input-0");
    country = countries[country];
    var postcode = setValue("shipping-postcode");
    if (isCalculating) {
      if (
        postcode !== null &&
        street !== null &&
        city !== null &&
        country !== null
      ) {
        findClosestAgentByAddress(carrier, country, postcode, city, street);
      }
    }
  }, [isCalculating]);

  useEffect(() => {
    setExtensionData(
      "smart-send-logistics",
      "selectedpickuppoints",
      selectedpickuppoints
    );
  }, [setExtensionData, selectedpickuppoints]);

  const [hasInteractedWithOtherInput, setHasInteractedWithOtherInput] =
    useState(false);

  useEffect(() => {

    if (
      setSelectedpickuppoints !== "other"
    ) {
      if (validationError) {
        clearValidationError(validationErrorId);
      }
      return;
    }
    setValidationErrors({
      [validationErrorId]: {
        message: __("Please add some text", "shipping-workshop"),
        hidden: !hasInteractedWithOtherInput,
      },
    });

  }, [
    clearValidationError,
    setSelectedpickuppoints,
    setValidationErrors,
    validationErrorId,
    debouncedSetExtensionData,
    validationError,
  ]);

  return (
    <div className="wp-block-shipping-workshop-not-at-home">
      <div className="coountry"></div>

      <SelectControl
        label={__("TLS Delievery Point", "shipping-workshop")}
        value={selectedpickuppoints}
        options={options}
        onChange={setSelectedpickuppoints}
        className="shiiping_smart_ar_hide"
      />
    </div>
  );
};



// Function to find closest agent by address
function findClosestAgentByAddress(carrier, country, postalCode, city, street) {

  carrier = carrier;
  country = country;
  postalCode = postalCode;
  city = city;
  street = street;

  getPickupPoints(carrier, country, postalCode, city, street);
}

function setValue(id) {
  var element = document.getElementById(id);
  if (element) {
    return element.value;
  }
  return null;
}

const getPickupPoints = async (
  meta_data,
  country,
  postalCode,
  city,
  street
) => {
  const url = "/wp-json/smart-send-logistics/v1/get-closest-pickup-points"; // Your endpoint URL

  const data = {
    country: country,
    postCode: postalCode,
    city: city,
    street: street,
    meta_data: meta_data,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      jQuery(".shiiping_smart_ar_hide").hide();
      jQuery(".shiiping_smart_ar_hide").css("opacity", 0);
    } else {
      const resultz = await response.json();
      const sortedData = Object.entries(resultz).sort((a, b) => {
        const distanceA =
          a[0] === "0"
            ? 0
            : parseFloat(
                a[1].split(":")[0].replace("km", "").replace("m", "")
              ) * (a[1].includes("km") ? 1000 : 1);
        const distanceB =
          b[0] === "0"
            ? 0
            : parseFloat(
                b[1].split(":")[0].replace("km", "").replace("m", "")
              ) * (b[1].includes("km") ? 1000 : 1);
        return distanceB - distanceA;
      });
      var reversedrestoreddata = sortedData.reverse();
      var output = "";
      jQuery.each(reversedrestoreddata, function (key, value) {
        output += '<option value="' + value[0] + '">' + value[1] + "</option>";
      });
      jQuery(".shiiping_smart_ar_hide").find("select").html(output);
      gettheselectedmethod();
    }
  } catch (error) {
    console.log(error);
    alert("Failed to fetch pick-up points");

  }
};

function gettheselectedmethod() {
  var selected = jQuery(".wc-block-components-shipping-rates-control")
    .find("input[type=radio]:checked")
    .val();
  if (selected.indexOf("smart_send") !== -1) {
    jQuery(".shiiping_smart_ar_hide").show();
    jQuery(".shiiping_smart_ar_hide").css("opacity", 1);
  } else {
    jQuery(".shiiping_smart_ar_hide").hide();
    jQuery(".shiiping_smart_ar_hide").css("opacity", 0);
  }
}
