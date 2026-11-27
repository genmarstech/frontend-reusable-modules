// Company facts, in one place so a changed phone number is one edit, not
// nine. Everything here was taken from the client's current site; confirm
// it with the client before launch, the same as the product data.

export const COMPANY = "Prime Field Agriculture Limited";
export const DOMAIN = "www.primefieldagricultureltd.com";

export const KENYA = {
  phone: "+254 782 591065",
  whatsapp: "+254 113 026 558",
  email: "sales@primefieldagricultureltd.com",
  hours: "08:00–18:00",
};

export const TANZANIA = {
  phone: "+255 741 423091",
  email: "info@primefieldagricultureltd.com",
  hours: "08:00–17:00",
  address: "PO Box 24211, Kawe Ward, Kinondoni District, Mbezi Beach Rd, Dar es Salaam",
  shortAddress: "Mbezi Beach Rd, Kawe, Kinondoni, Dar es Salaam",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Mbezi+Beach+Road+Kawe+Dar+es+Salaam",
};

/** Digits only, the form wa.me and tel: links want. */
export const digits = (s: string) => s.replace(/[^\d+]/g, "");

export const WHATSAPP_URL = `https://wa.me/${digits(KENYA.whatsapp).replace("+", "")}`;
