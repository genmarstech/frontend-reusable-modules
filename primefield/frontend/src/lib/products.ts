// The catalogue. Names and descriptions come from the client's current site.
//
// UNCONFIRMED: every `hs` and `pack` value is a placeholder chosen to be
// plausible for the commodity. The client must confirm each one before
// launch, because a buyer will quote an HS code back to customs.

export type Category =
  | "Nuts"
  | "Coffee"
  | "Spices"
  | "Oil seeds"
  | "Beans & pulses"
  | "Grains & sugar"
  | "Sisal fibre"
  | "Fresh & oils";

export type Product = {
  id: string;
  name: string;
  cat: Category;
  hs: string;
  pack: string;
  desc: string;
};

export const PRODUCTS: Product[] = [
  { id: "macadamia", name: "Organic Macadamia Nuts", cat: "Nuts", hs: "0802.62", pack: "11.34 kg vacuum cartons", desc: "Organic macadamia kernels from smallholder farms, sorted by style (wholes, halves and pieces) and vacuum packed to keep them fresh." },
  { id: "cashew", name: "Cashew Nuts", cat: "Nuts", hs: "0801.32", pack: "22.68 kg vacuum packs", desc: "Raw cashew kernels, graded by size and vacuum packed for wholesale, roasting and snack processing." },
  { id: "almond", name: "Almond Nuts", cat: "Nuts", hs: "0802.12", pack: "22.68 kg cartons", desc: "Whole almond kernels for snacking, baking and further processing." },
  { id: "arabica", name: "Arabica Green Coffee – Commercial", cat: "Coffee", hs: "0901.11", pack: "60 kg jute bags", desc: "Commercial-grade Arabica green coffee from highland growing areas, cleaned and bagged for roasters and traders." },
  { id: "robusta", name: "Robusta Green Coffee", cat: "Coffee", hs: "0901.11", pack: "60 kg jute bags", desc: "Robusta green coffee for blends and soluble coffee, cleaned and bagged at origin." },
  { id: "pepper", name: "Black Pepper", cat: "Spices", hs: "0904.11", pack: "25 / 50 kg PP bags", desc: "Whole black peppercorns, sun dried, cleaned and sorted." },
  { id: "cardamom", name: "Cardamon", cat: "Spices", hs: "0908.31", pack: "25 kg cartons", desc: "Green cardamom pods, dried and sorted by size and colour." },
  { id: "cinnamon", name: "Cinnamon", cat: "Spices", hs: "0906.11", pack: "25 kg cartons", desc: "Cinnamon quills and bark, dried and cut to length." },
  { id: "cloves", name: "Cloves", cat: "Spices", hs: "0907.10", pack: "25 / 50 kg PP bags", desc: "Whole cloves, hand picked and sun dried." },
  { id: "flax", name: "Flax Seeds", cat: "Oil seeds", hs: "1204.00", pack: "50 kg PP bags", desc: "Brown flax seeds, machine cleaned, for oil pressing and food use." },
  { id: "soya", name: "Soya Beans/Soybeans", cat: "Oil seeds", hs: "1201.90", pack: "50 kg PP bags or bulk", desc: "Yellow soya beans for crushing, animal feed and food processing." },
  { id: "mung", name: "Green Mung Beans", cat: "Beans & pulses", hs: "0713.31", pack: "25 / 50 kg PP bags", desc: "Green mung beans, machine cleaned and sorted, for cooking and sprouting." },
  { id: "kidney", name: "Red Kidney Beans", cat: "Beans & pulses", hs: "0713.33", pack: "25 / 50 kg PP bags", desc: "Dark red kidney beans, cleaned and sorted by size." },
  { id: "maize", name: "Red Corn/Maize", cat: "Grains & sugar", hs: "1005.90", pack: "50 kg PP bags or bulk", desc: "Red corn/maize for milling, animal feed and food processing." },
  { id: "sugar", name: "ICUMSA 45 White Refined Sugar", cat: "Grains & sugar", hs: "1701.99", pack: "50 kg PP bags", desc: "ICUMSA 45 white refined sugar, food grade." },
  { id: "sisal-ssug", name: "Sisal Fiber SSUG Grade", cat: "Sisal fibre", hs: "5305.00", pack: "200 kg pressed bales", desc: "SSUG grade sisal fibre, brushed and baled for spinning, twine and rope." },
  { id: "sisal-ug", name: "Sisal Fiber UG Grade", cat: "Sisal fibre", hs: "5305.00", pack: "200 kg pressed bales", desc: "UG grade sisal fibre, baled for twine, mats, padding and pulp." },
  { id: "avocado", name: "Organic Hass Avocado", cat: "Fresh & oils", hs: "0804.40", pack: "4 kg cartons, reefer", desc: "Organic Hass avocados, packed in cartons and shipped in refrigerated containers." },
  { id: "mac-oil", name: "Macadamia Oil", cat: "Fresh & oils", hs: "1515.90", pack: "Drums or IBC totes", desc: "Macadamia oil for food and cosmetic use, supplied in bulk." },
  { id: "avo-oil", name: "Avocado Oil", cat: "Fresh & oils", hs: "1515.90", pack: "Drums or IBC totes", desc: "Avocado oil for cooking and cosmetic use, supplied in bulk." },
];

export const FEATURED = ["macadamia", "cashew", "arabica", "robusta", "cloves", "cardamom", "avocado", "sisal-ssug"];

export const ORIGIN = "Kenya · Tanzania";

export const CATEGORIES: Category[] = [...new Set(PRODUCTS.map((p) => p.cat))];

/** "Beans & pulses" -> "beans-and-pulses"; the footer links filter by these. */
export const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export const productImage = (p: Product) => `/img/products/${p.id}.jpg`;

export const productHref = (p: Product) => `/products/${p.id}/`;

const byIdMap = new Map(PRODUCTS.map((p) => [p.id, p]));
export const byId = (id: string) => byIdMap.get(id);

/** Same category first, then featured lines from elsewhere, four in all. */
export function relatedTo(p: Product): Product[] {
  const same = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id);
  const more = PRODUCTS.filter((x) => x.cat !== p.cat && FEATURED.includes(x.id));
  return [...same, ...more].slice(0, 4);
}
