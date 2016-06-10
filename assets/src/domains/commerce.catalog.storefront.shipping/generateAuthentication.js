var extend = require("extend");

module.exports = function generateAuthentication(cred, shippingInfo) {
        var params = {
        WebAuthenticationDetail: {
            UserCredential: {
                Key: cred.Key,
                Password: cred.Password
            }
        },
        ClientDetail: {
            AccountNumber: cred.AccountNumber,
            MeterNumber: cred.MeterNumber
        }
        };

        params.Version = {
            ServiceId: 'crs',
            Major: 16,
            Intermediate: 0,
            Minor: 0
        };

        return extend(params, {
            ReturnTransitAndCommit: true,
            CarrierCodes: ['FDXE','FDXG'],
            RequestedShipment: {
                DropoffType: 'REGULAR_PICKUP',
                PackagingType: 'YOUR_PACKAGING',
                Shipper: {
                Contact: {
                    PersonName: 'Sender Name',
                    CompanyName: 'Company Name',
                    PhoneNumber: '5555555555'
                },
                Address: {
                    StreetLines: [
                        shippingInfo.OriginAddress.Address1
                    ],
                    City: shippingInfo.OriginAddress.CityOrTown,
                    StateOrProvinceCode: shippingInfo.OriginAddress.StateOrProvince,
                    PostalCode: shippingInfo.OriginAddress.PostalOrZipCode,
                    CountryCode: shippingInfo.OriginAddress.CountryCode
                }
                },
                Recipient: {
                Contact: {
                    PersonName: 'Recipient Name',
                    CompanyName: 'Company Receipt Name',
                    PhoneNumber: '5555555555'
                },
                Address: {
                    StreetLines: [
                            shippingInfo.DestinationAddress.Address1
                        ],
                        City: shippingInfo.DestinationAddress.CityOrTown,
                        StateOrProvinceCode: shippingInfo.DestinationAddress.StateOrProvince ? shippingInfo.DestinationAddress.StateOrProvince.length <= 2 ? shippingInfo.DestinationAddress.StateOrProvince : "" : "",
                        PostalCode: shippingInfo.DestinationAddress.PostalOrZipCode,
                        CountryCode: shippingInfo.DestinationAddress.CountryCode,
                        Residential: shippingInfo.DestinationAddress.AddressType == "Residential" ? true : false
                }
                },
                ShippingChargesPayment: {
                PaymentType: 'SENDER',
                Payor: {
                    ResponsibleParty: {
                    AccountNumber: cred.AccountNumber
                    }
                }
                },
                PackageCount: '1',
                RequestedPackageLineItems: {
                SequenceNumber: 1,
                GroupPackageCount: 1,
                Weight: {
                    Units: shippingInfo.Items[0].UnitMeasurements.Weight.Unit == "lbs" ? 'LB' : shippingInfo.Items[0].UnitMeasurements.Weight.Unit,
                    Value: shippingInfo.Items[0].UnitMeasurements.Weight.Value
                },
                Dimensions: {
                    Length: shippingInfo.Items[0].UnitMeasurements.Length.Value,
                    Width: shippingInfo.Items[0].UnitMeasurements.Width.Value,
                    Height: shippingInfo.Items[0].UnitMeasurements.Height.Value,
                    Units: shippingInfo.Items[0].UnitMeasurements.Length.Unit.toUpperCase()
                }
                }
            }
        });
    };