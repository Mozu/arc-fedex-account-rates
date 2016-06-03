/**
 * Implementation for http.commerce.catalog.storefront.shipping.requestRates.after


 * HTTP Actions all receive a similar context object that includes
 * `request` and `response` objects. These objects are similar to
 * http.IncomingMessage objects in NodeJS.

{
  configuration: {},
  request: http.ClientRequest,
  response: http.ClientResponse
}

 * Call `response.end()` to end the response early.
 * Call `response.set(headerName)` to set an HTTP header for the response.
 * `request.headers` is an object containing the HTTP headers for the request.
 * 
 * The `request` and `response` objects are both Streams and you can read
 * data out of them the way that you would in Node.

 */

var SoapInit = require("./soap-init");
var Authentication = require("./generateAuthentication");
var _ = require("lodash");

module.exports = function(context, callback) {
    var soapinit = SoapInit;
    var authentication = Authentication;
    var soap = require('soap');
    
    // FedEx credentials
    var cred = {
        Key: 'FedEx_Key',
        Password: 'FedEx_Password',
        AccountNumber: 'FedEx_Account#',
        MeterNumber: 'FedEx_Meter#'
    };
    
    // Create SOAP client to send data to FedEx API
    soap.createClient("./RateService_v16.wsdl", {endpoint: "https://ws.fedex.com/web-services"}, function(err, client){
        var fedexParams = authentication(cred, context.request.body);
        
        // Send data to FedEx API
        client.getRates(fedexParams, function(err, result){
            
            // Check if returned FedEx results are successful
            if(result.HighestSeverity == 'SUCCESS'){
                var fedexRates = result.RateReplyDetails;
                
                // Get index of Mozu's FedEx shipping information
                var mozuIndex = _.findIndex(context.response.body.rates, function(rate){
                    return rate.carrierId == "fedex";
                });
                if(mozuIndex > -1){
                    // Mozu's FedEx information
                    var shippingRates = context.response.body.rates[mozuIndex].shippingRates;
                    
                    // Loop through each rate returned from fedex, and change the Mozu listed rates to the FedEx account rates
                
                    _.forEach(fedexRates, function(rate){
                        // Check if rate is enabled
                        var index = _.findIndex(shippingRates, function(info){
                            return info.code == "fedex_"+ rate.ServiceType;
                        });
                        
                        // if rate is enabled, change Mozu model
                        if(index > -1){
                            shippingRates[index].amount = parseFloat(rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes.Amount);
                            _.forEach(shippingRates[index].customAttributes, function(attr){
                                if(attr.key == "base_charge"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalBaseCharge.Amount +" USD";
                                } else if (attr.key == "total_freight_discounts"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalFreightDiscounts.Amount +" USD";
                                } else if (attr.key == "total_surcharges"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalSurcharges.Amount +" USD";
                                }
                            });
                            shippingRates[index].shippingItemRates[0].amount = parseFloat(rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes.Amount);
                        } else if (rate.ServiceType == "GROUND_HOME_DELIVERY"){
                            // Ground is unique and has a different code
                            index = _.findIndex(shippingRates, function(info){
                                return info.code == "fedex_FEDEX_GROUND";
                            });
                            shippingRates[index].amount = parseFloat(rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes.Amount);
                            _.forEach(shippingRates[index].customAttributes, function(attr){
                                if(attr.key == "base_charge"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalBaseCharge.Amount +" USD";
                                } else if (attr.key == "total_freight_discounts"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalFreightDiscounts.Amount +" USD";
                                } else if (attr.key == "total_surcharges"){
                                    attr.value = rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalSurcharges.Amount +" USD";
                                }
                            });
                            shippingRates[index].shippingItemRates[0].amount = parseFloat(rate.RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes.Amount);
                        }
                    });
                }
            } else {
                console.log(result);
            }
            callback();
                
        });
    });
};