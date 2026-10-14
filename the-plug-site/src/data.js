/* THE PLUG sample catalogue and admin-style configuration.
   Everything here is SAMPLE content for the prototype. Names, prices and opening
   states are placeholders and do not describe real partners. Replace with data
   from the merchant tools when they exist. */
(function (root) {
  'use strict';
  const PLUG = root.PLUG = root.PLUG || {};

  /* ---------- pricing and rules (admin-configurable in the demo) ---------- */
  PLUG.CONFIG = {
    delivery: { base: 30, perKm: 6, extraStop: 12, consolidationFee: 6, bulkyExtra: 40, roadFactor: 1.3, speedKmh: 20, handlingMin: 3, maxStops: 4, maxSpreadKm: 5, maxExtraMin: 20, hub: { x: 2.4, y: 3.0 } },
    serviceFeePct: 0, taxPct: 0, tipOptions: [0, 10, 20, 30],
    codLimitNewAccount: 800,
    promos: { WELCOME: { pct: 10, max: 50, label: '10% off your first order, up to NLe 50' } },
    errand: { base: 40, perKm: 6, perExtraStop: 15, waitFreeMin: 15, waitPer15: 10, nightPct: 20 },
    ride: { nightPct: 20, waitFreeMin: 5, waitPerMin: 2 },
    stay: { taxPct: 5, taxLabel: 'Tourism levy (sample rate)' },
    points: { per: 10 }
  };

  /* ---------- areas (pilot zone is configurable) ---------- */
  PLUG.ZONES = [
    { id: 'aberdeen', name: 'Aberdeen', x: 2.0, y: 1.0, pilot: true },
    { id: 'lumley', name: 'Lumley', x: 1.0, y: 3.5, pilot: true },
    { id: 'wilkinson', name: 'Wilkinson Road', x: 3.2, y: 3.6, pilot: true },
    { id: 'hillstation', name: 'Hill Station', x: 5.0, y: 5.0, pilot: false },
    { id: 'goderich', name: 'Goderich', x: -1.5, y: -3.0, pilot: false },
    { id: 'kissy', name: 'Kissy', x: 8.2, y: 2.5, pilot: false }
  ];

  /* ---------- merchants ---------- */
  // availability.state: open | closed | unknown. Unknown merchants must be confirmed before ordering.
  const M = PLUG.MERCH = {};
  function merch(o) { M[o.id] = o; return o; }
  merch({ id: 'r1', kind: 'restaurant', name: 'Royal Bites', cuisines: ['African', 'Fast food'], x: 2.6, y: 3.1, prep: 18, zone: 'Wilkinson Road', blurb: 'Rice dishes and burgers', state: 'open', updated: '09:05', tone: 'food' });
  merch({ id: 'r2', kind: 'restaurant', name: 'Ocean Grill', cuisines: ['African', 'Seafood'], x: 3.8, y: 3.9, prep: 25, zone: 'Wilkinson Road', blurb: 'Grilled fish and seafood plates', state: 'open', updated: '09:10', tone: 'food' });
  merch({ id: 'r3', kind: 'restaurant', name: "Zee's Kitchen", cuisines: ['African', 'Healthy'], x: 1.4, y: 3.0, prep: 20, zone: 'Lumley', blurb: 'Home-style soups and stews', state: 'open', updated: '09:02', tone: 'food' });
  merch({ id: 'r4', kind: 'restaurant', name: 'Mama Africa', cuisines: ['African'], x: 7.6, y: 2.4, prep: 22, zone: 'Kissy', blurb: 'Traditional plates', state: 'unknown', updated: '08:12', tone: 'food' });
  merch({ id: 'r5', kind: 'restaurant', name: 'Slice Corner', cuisines: ['Italian', 'Fast food'], x: 3.0, y: 4.2, prep: 20, zone: 'Wilkinson Road', blurb: 'Pizza and pasta', state: 'closed', opens: '11:00', updated: '09:00', tone: 'food' });
  merch({ id: 'r6', kind: 'restaurant', name: 'Wok Express', cuisines: ['Chinese'], x: 2.2, y: 2.0, prep: 17, zone: 'Aberdeen', blurb: 'Noodles and fried rice', state: 'open', updated: '09:08', tone: 'food' });
  merch({ id: 'r7', kind: 'restaurant', name: 'Green Bowl', cuisines: ['Healthy'], x: 1.9, y: 3.4, prep: 14, zone: 'Lumley', blurb: 'Bowls, wraps and smoothies', state: 'open', updated: '09:01', tone: 'food' });
  merch({ id: 's1', kind: 'store', name: 'FreshMart', cuisines: [], x: 2.8, y: 3.5, prep: 25, zone: 'Wilkinson Road', blurb: 'Supermarket staples and drinks', state: 'open', updated: '09:00', tone: 'market' });
  merch({ id: 's2', kind: 'store', name: 'Daily Basket', cuisines: [], x: 1.2, y: 2.6, prep: 30, zone: 'Lumley', blurb: 'Fresh produce and household items', state: 'open', updated: '09:00', tone: 'market' });
  merch({ id: 'p1', kind: 'pharmacy', name: 'CityCare Pharmacy', cuisines: [], x: 2.3, y: 3.0, prep: 15, zone: 'Wilkinson Road', blurb: 'Licensed pharmacy partner (sample)', state: 'open', updated: '09:00', tone: 'care' });
  merch({ id: 'pr1', kind: 'print', name: 'Sample Print Shop', cuisines: [], x: 2.0, y: 3.8, prep: 60, zone: 'Lumley', blurb: 'Local print partner (sample)', state: 'open', updated: '09:00', tone: 'studio' });

  /* ---------- Eats menus ---------- */
  const mk = (rid, code, name, price, extra) => Object.assign({ id: rid + '-' + code, merchantId: rid, name, price, kind: 'item', hot: true, sec: 'Mains' }, extra || {});
  const EXTRAS = [{ n: 'Extra portion of sauce', p: 8 }, { n: 'Fried plantain', p: 15 }, { n: 'Extra pepper', p: 0 }];
  const SIDES = [
    ['plantain', 'Fried plantain', 25, 'Sides'], ['water', 'Bottled water', 10, 'Drinks'], ['soda', 'Soft drink', 18, 'Drinks'],
    ['juice', 'Fresh juice', 30, 'Drinks'], ['fruit', 'Fruit cup', 25, 'Desserts']
  ];
  const MENUS = {
    r1: [['jollof', 'Jollof rice and chicken', 95, { desc: 'Smoky jollof with grilled chicken', tags: ['spicy'] }], ['fried', 'Fried rice and plantain', 85, { desc: 'Vegetable fried rice, fried plantain' }], ['cassava', 'Cassava leaf and rice', 80, { desc: 'Slow-cooked cassava leaf stew' }], ['burger', 'Burger combo', 90, { desc: 'Beef burger, chips and a soft drink' }]],
    r2: [['barra', 'Grilled barracuda and rice', 140, { desc: 'Grilled fish, rice, salad' }], ['pepper', 'Fish pepper soup', 90, { desc: 'Hot broth with fresh fish', tags: ['spicy'] }], ['snapper', 'Fried snapper plate', 150, { desc: 'Whole fried snapper, chips' }], ['seafood', 'Seafood rice', 130, { desc: 'Rice with prawns and fish' }]],
    r3: [['gnut', 'Groundnut soup and rice', 85, { desc: 'Rich groundnut soup', allergens: 'Peanuts (as supplied by the merchant)' }], ['okra', 'Okra stew and rice', 80, { desc: 'Okra stew with fish' }], ['salad', 'Grilled chicken salad', 75, { desc: 'Greens, tomato, grilled chicken', tags: ['light'] }], ['potato', 'Potato leaf and rice', 85, { desc: 'Classic potato leaf stew' }]],
    r4: [['palm', 'Palm oil chop plate', 90, { desc: 'Traditional plate' }], ['fufu', 'Fufu and soup', 90, { desc: 'Fufu with soup of the day' }], ['potato', 'Potato leaf and rice', 80, { desc: 'Potato leaf stew' }]],
    r5: [['margh', 'Margherita pizza', 120, { desc: 'Tomato, mozzarella, basil', tags: ['vegetarian'], allergens: 'Gluten, dairy (as supplied by the merchant)' }], ['chicken', 'Chicken pizza', 150, { desc: 'Chicken, peppers, onion', allergens: 'Gluten, dairy (as supplied by the merchant)' }], ['pasta', 'Pasta bolognese', 110, { desc: 'Beef sauce, spaghetti' }]],
    r6: [['cfr', 'Chicken fried rice', 95, { desc: 'Wok-fried rice, chicken, egg' }], ['sweet', 'Sweet and sour chicken', 110, { desc: 'Crisp chicken, sweet sauce' }], ['veg', 'Vegetable noodles', 80, { desc: 'Stir-fried noodles', tags: ['vegetarian'] }]],
    r7: [['bowl', 'Grain bowl', 70, { desc: 'Rice, greens, grilled chicken' }], ['wrap', 'Veggie wrap', 65, { desc: 'Roasted vegetables, hummus', tags: ['vegetarian'] }], ['smoothie', 'Mango smoothie', 45, { desc: 'Fresh mango, ice', sec: 'Drinks', hot: false }]]
  };
  const ITEMS = PLUG.ITEMS = {};
  Object.keys(MENUS).forEach(rid => {
    MENUS[rid].forEach(r => { const it = mk(rid, r[0], r[1], r[2], r[3]); it.extras = EXTRAS; ITEMS[it.id] = it; });
    if (rid !== 'r7') SIDES.forEach(s => { const it = mk(rid, s[0], s[1], s[2], { sec: s[3], hot: s[3] === 'Sides' }); ITEMS[it.id] = it; });
  });

  /* ---------- Market items (stock-aware) ---------- */
  const mi = (sid, code, name, price, stock, cat, extra) => { const it = Object.assign({ id: sid + '-' + code, merchantId: sid, name, price, stock, cat, kind: 'item', hot: false, unit: '' }, extra || {}); ITEMS[it.id] = it; };
  mi('s1', 'rice', 'Rice, 5 kg', 140, 40, 'Staples'); mi('s1', 'palm', 'Palm oil, 1 L', 45, 25, 'Staples'); mi('s1', 'oil', 'Vegetable oil, 1 L', 55, 18, 'Staples');
  mi('s1', 'eggs', 'Eggs, tray of 30', 85, 12, 'Dairy and eggs'); mi('s1', 'water', 'Bottled water, 12 pack', 60, 30, 'Drinks'); mi('s1', 'bread', 'Sliced bread', 25, 0, 'Staples');
  mi('s1', 'tomato', 'Tomato paste, tin', 12, 60, 'Staples'); mi('s1', 'beer', 'Beer, 6 pack', 120, 20, 'Drinks', { restricted: '18+' });
  mi('s2', 'onion', 'Onions, 1 kg', 20, 50, 'Fresh'); mi('s2', 'chicken', 'Frozen chicken, 1 kg', 90, 14, 'Fresh'); mi('s2', 'milk', 'Milk powder, 400 g', 75, 22, 'Dairy and eggs');
  mi('s2', 'sugar', 'Sugar, 1 kg', 28, 3, 'Staples'); mi('s2', 'plantain', 'Plantain, bunch', 35, 20, 'Fresh'); mi('s2', 'pepper', 'Fresh pepper, 250 g', 15, 30, 'Fresh'); mi('s2', 'detergent', 'Washing powder, 1 kg', 40, 15, 'Household');

  /* ---------- Care items ---------- */
  const ci = (code, name, price, extra) => { const it = Object.assign({ id: 'p1-' + code, merchantId: 'p1', name, price, stock: 20, cat: 'Personal essentials', kind: 'item', hot: false, sensitive: false }, extra || {}); ITEMS[it.id] = it; };
  ci('cond3', 'Condoms, 3 pack', 25, { sensitive: true }); ci('cond12', 'Condoms, 12 pack', 70, { sensitive: true });
  ci('preg', 'Pregnancy test, single', 35, { sensitive: true }); ci('pads', 'Sanitary pads, 10 pack', 28, { sensitive: true });
  ci('sanit', 'Hand sanitiser, 250 ml', 20, {});
  ci('ec', 'Emergency contraception', 0, { sensitive: true, cat: 'Pharmacist confirmed', pharmacist: true, enabled: false, note: 'Needs the licensed pharmacist to confirm availability and rules. Not enabled in this prototype.' });
  ci('pain', 'Pain relief tablets', 0, { cat: 'Pharmacist confirmed', pharmacist: true, enabled: false, note: 'Medicines are supplied only through licensed pharmacies. Not enabled in this prototype.' });

  /* ---------- Studio ---------- */
  PLUG.STUDIO = {
    print: [
      { id: 'pr-cards', name: 'Business cards', variants: [{ l: '100 cards', p: 120 }, { l: '250 cards', p: 240 }, { l: '500 cards', p: 420 }], days: 2, desc: 'Matt or gloss, 350 gsm' },
      { id: 'pr-flyers', name: 'Flyers, A5', variants: [{ l: '100 flyers', p: 150 }, { l: '500 flyers', p: 520 }, { l: '1000 flyers', p: 900 }], days: 2, desc: 'Full colour, one side or both' },
      { id: 'pr-banner', name: 'Banner, 2 x 1 m', variants: [{ l: 'Vinyl banner', p: 280 }, { l: 'Vinyl banner with eyelets', p: 310 }], days: 3, bulky: true, desc: 'Weatherproof vinyl' },
      { id: 'pr-tee', name: 'T-shirt print', variants: [{ l: 'Small', p: 90 }, { l: 'Medium', p: 90 }, { l: 'Large', p: 90 }, { l: 'X-large', p: 95 }], days: 3, desc: 'One colour front print' },
      { id: 'pr-mug', name: 'Mug print', variants: [{ l: '1 mug', p: 60 }, { l: '6 mugs', p: 300 }], days: 3, desc: 'Ceramic, wrap-around print' },
      { id: 'pr-photo', name: 'Photo print, 8 x 10', variants: [{ l: 'Print only', p: 40 }, { l: 'Framed print', p: 110, bulky: true }], days: 1, desc: 'Lab-quality print' }
    ],
    photo: [
      { id: 'ph-id', name: 'ID and passport photos', price: 40, hours: '20 minutes at the studio', edited: '4 prints', days: 0, rights: 'Personal use', desc: 'Standard size, plain background' },
      { id: 'ph-portrait', name: 'Portrait session', price: 250, hours: '1 hour', edited: '10 edited photos', days: 3, rights: 'Personal use', desc: 'Studio or outdoor location' },
      { id: 'ph-product', name: 'Product shoot', price: 600, hours: 'Up to 20 items', edited: '1 edited photo per item', days: 4, rights: 'Commercial use for your own business', desc: 'Clean backgrounds for shops and menus' },
      { id: 'ph-event', name: 'Event coverage', price: 900, hours: '4 hours', edited: '80 edited photos', days: 5, rights: 'Personal use, commercial use by agreement', desc: 'Birthdays, launches, community events' },
      { id: 'ph-wedding', name: 'Wedding day', price: 3500, hours: '8 hours', edited: '300 edited photos', days: 14, rights: 'Personal use', desc: 'Full day coverage, one photographer' }
    ],
    build: [
      { id: 'bd-site', name: 'Starter website', price: 6000, weeks: 3, desc: 'Up to 5 pages, mobile friendly, contact form', revisions: 2 },
      { id: 'bd-shop', name: 'Online shop', price: 12000, weeks: 5, desc: 'Up to 30 products, cart and order management', revisions: 2 },
      { id: 'bd-app', name: 'Mobile app, first version', price: 45000, weeks: 10, desc: 'One platform, up to 6 screens, store listing help', revisions: 3 },
      { id: 'bd-logo', name: 'Logo and brand kit', price: 2500, weeks: 2, desc: 'Logo, colours, fonts, social profile images', revisions: 3 },
      { id: 'bd-social', name: 'Social media setup', price: 800, weeks: 1, desc: 'Profiles, bios, banners, first posts', revisions: 1 },
      { id: 'bd-listing', name: 'Business listing and storefront', price: 600, weeks: 1, desc: 'Map listings plus your THE PLUG storefront', revisions: 1 }
    ],
    hosting: { name: 'Hosting and maintenance plan', monthly: 250, desc: 'Hosting, small edits, security updates. Optional, month to month.' },
    providers: [
      { id: 'ph-a', type: 'photo', name: 'Sample Photographer A', verified: 'Sample', portfolio: 12 },
      { id: 'bd-a', type: 'build', name: 'Sample Web and App Studio', verified: 'Sample', portfolio: 8 }
    ]
  };

  /* ---------- Stays ---------- */
  // blocked: [startDay, endDay] offsets from today, so the sample stays always show some unavailable dates
  PLUG.STAYS = [
    { id: 'st1', name: 'The African Regent', type: 'Hotel', area: 'Aberdeen', rate: 1850, cap: 3, instant: true, checkIn: '14:00', checkOut: '11:00', cancel: 'Free cancellation up to 48 hours before check-in.', amenities: ['Air conditioning', 'Breakfast', 'Backup power', 'Wi-Fi', 'Parking'], rules: 'No smoking in rooms. Quiet hours after 22:00.', cleaning: 0, blocked: [[6, 10]], tone: 'stay' },
    { id: 'st2', name: 'Vista Luxury Apartments', type: 'Apartment', area: 'Lumley', rate: 1450, cap: 4, instant: false, checkIn: '15:00', checkOut: '11:00', cancel: 'Free cancellation up to 72 hours before check-in. One night charged after that.', amenities: ['Kitchen', 'Air conditioning', 'Backup power', 'Wi-Fi'], rules: 'No parties. Host approval needed for extra guests.', cleaning: 150, blocked: [[1, 4]], tone: 'stay' },
    { id: 'st3', name: 'Jungle Lodge', type: 'Guesthouse', area: 'Peninsula', rate: 1150, cap: 2, instant: false, checkIn: '14:00', checkOut: '10:00', cancel: 'Free cancellation up to 7 days before check-in.', amenities: ['Garden', 'Breakfast', 'Backup power'], rules: 'Quiet property. No pets.', cleaning: 0, blocked: [], tone: 'stay' },
    { id: 'st4', name: 'Hilltop Guesthouse', type: 'Guesthouse', area: 'Hill Station', rate: 900, cap: 3, instant: true, checkIn: '13:00', checkOut: '11:00', cancel: 'Free cancellation up to 24 hours before check-in.', amenities: ['Views', 'Breakfast', 'Wi-Fi'], rules: 'No smoking indoors.', cleaning: 0, blocked: [[16, 20]], tone: 'stay' },
    { id: 'st5', name: 'Beachfront Holiday Home', type: 'Holiday rental', area: 'Peninsula', rate: 2600, cap: 6, instant: false, checkIn: '15:00', checkOut: '10:00', cancel: 'Half refund up to 14 days before check-in.', amenities: ['Kitchen', 'Beach access', 'Backup power', 'Parking'], rules: 'Deposit agreed with the host before arrival.', cleaning: 300, blocked: [], tone: 'stay' }
  ];

  /* ---------- Travel ---------- */
  PLUG.PACKAGES = [
    { id: 'pk1', name: 'Sierra Leone Getaway', days: 7, nights: 6, price: 18500, tone: 'travel', summary: 'City, peninsula beaches and a day on the water', includes: ['6 nights in a partner hotel', 'Airport transfers', 'Guided city tour', 'Beach day', 'Daily breakfast'], excludes: ['International flights', 'Lunch and dinner', 'Personal spending'], cancel: 'Free cancellation until 30 days before travel. After that, 50% of the package price.' },
    { id: 'pk2', name: 'Island Escape', days: 5, nights: 4, price: 25000, tone: 'travel', summary: 'Boat trip, island stay and nature walks', includes: ['4 nights, island lodge and city hotel', 'Boat transfers', 'Guided walks', 'Breakfast and dinner'], excludes: ['International flights', 'Drinks', 'Personal spending'], cancel: 'Free cancellation until 45 days before travel. Boat and lodge deposits are not refundable after that.' },
    { id: 'pk3', name: 'Cultural Tour', days: 4, nights: 3, price: 15000, tone: 'travel', summary: 'History, markets, music and food', includes: ['3 nights in a partner guesthouse', 'Local guide', 'Museum and market visits', 'Cooking class'], excludes: ['International flights', 'Most lunches', 'Personal spending'], cancel: 'Free cancellation until 21 days before travel.' }
  ];
  PLUG.ACTIVITIES = [
    { id: 'a1', name: 'Freetown city walking tour', tags: ['history', 'culture'], cost: 450, hours: 3, area: 'Freetown' },
    { id: 'a2', name: 'Bunce Island boat visit', tags: ['history'], cost: 1600, hours: 6, area: 'Estuary' },
    { id: 'a3', name: 'Chimpanzee sanctuary visit', tags: ['wildlife'], cost: 700, hours: 4, area: 'Hills' },
    { id: 'a4', name: 'Beach day on the peninsula', tags: ['beach'], cost: 350, hours: 6, area: 'Peninsula' },
    { id: 'a5', name: 'Island wildlife trip', tags: ['wildlife', 'adventure'], cost: 2200, hours: 8, area: 'River' },
    { id: 'a6', name: 'Island boat and snorkel day', tags: ['beach', 'adventure'], cost: 1900, hours: 7, area: 'Islands' },
    { id: 'a7', name: 'Local cooking class', tags: ['food', 'culture'], cost: 500, hours: 3, area: 'Freetown' },
    { id: 'a8', name: 'Market and street food tour', tags: ['food', 'culture'], cost: 400, hours: 3, area: 'Freetown' },
    { id: 'a9', name: 'Hill hike at sunrise', tags: ['adventure', 'wildlife'], cost: 300, hours: 4, area: 'Hills' }
  ];
  PLUG.TRANSFERS = {
    routes: [{ id: 'airport', name: 'Airport to city, hotel or home', base: 1800 }, { id: 'city', name: 'City to airport', base: 1800 }, { id: 'peninsula', name: 'City to peninsula beaches', base: 900 }],
    vehicles: [{ id: 'car', name: 'Standard car', seats: 3, bags: 3, mult: 1 }, { id: 'suv', name: 'Comfort SUV', seats: 4, bags: 5, mult: 1.35 }, { id: 'van', name: 'Van', seats: 8, bags: 10, mult: 1.8 }]
  };

  /* ---------- Errands and Ride ---------- */
  PLUG.ERRAND_TYPES = [
    { id: 'queue', name: 'Wait in line', icon: 'clock', hint: 'A runner waits for you and calls when it is nearly your turn.', needsBudget: false },
    { id: 'pickup', name: 'Pick up and bring', icon: 'box', hint: 'Documents, parcels or things you left behind.', needsBudget: false },
    { id: 'buy', name: 'Buy something', icon: 'cart', hint: 'A runner buys the item you describe, with a receipt.', needsBudget: true },
    { id: 'deliver', name: 'Drop off', icon: 'send', hint: 'Take something from you to someone else.', needsBudget: false },
    { id: 'multi', name: 'Several stops', icon: 'route', hint: 'A list of stops in one task.', needsBudget: false }
  ];
  PLUG.ERRAND_ALLOWED = ['Documents and forms', 'Parcels', 'Shopping', 'Forgotten belongings', 'Tickets and queues'];
  PLUG.ERRAND_PROHIBITED = ['Anything illegal', 'Cash transfers and loans', 'Weapons, drugs and controlled goods', 'Tasks that put the runner at risk', 'Collecting someone else’s identity documents without their written permission'];
  PLUG.VEHICLES = [
    { id: 'keke', name: 'Keke', seats: 3, bags: 2, base: 20, perKm: 5, note: 'Three-wheeler, short city trips' },
    { id: 'standard', name: 'Standard car', seats: 4, bags: 3, base: 35, perKm: 8, note: 'Everyday trips' },
    { id: 'comfort', name: 'Comfort car', seats: 4, bags: 4, base: 50, perKm: 11, note: 'Air conditioning, newer vehicles' },
    { id: 'van', name: 'Van', seats: 8, bags: 10, base: 80, perKm: 16, note: 'Groups and luggage' }
  ];

  /* ---------- order status steps ---------- */
  PLUG.STEPS = {
    order: ['Placed', 'Accepted by merchants', 'Being prepared', 'Ready for pickup', 'Courier collected', 'Delivered'],
    errand: ['Requested, cost approved', 'Runner assigned', 'Runner started', 'In progress', 'Completed'],
    ride: ['Searching for a driver', 'Driver accepted', 'Driver arriving', 'Trip started', 'Trip completed'],
    stayRequest: ['Request sent', 'Host approved', 'Booking confirmed', 'Stayed'],
    stayInstant: ['Booking confirmed', 'Stayed'],
    travel: ['Estimate', 'Request sent', 'Provider hold', 'Booking confirmed'],
    studio: ['Brief sent', 'Quote received', 'Quote approved', 'In progress', 'Delivered'],
    transfer: ['Request sent', 'Driver assigned', 'Booking confirmed', 'Completed']
  };

  /* ---------- language files ---------- */
  PLUG.LANG = {
    en: { search: 'What do you need today?', hello: 'Everything you need. In one place.', food: 'Food', groceries: 'Groceries', stays: 'Stays', errands: 'Errands', rides: 'Rides', travel: 'Travel', pharmacy: 'Pharmacy', shops: 'Studio', one: 'One Delivery', basket: 'Basket', orders: 'Orders', wallet: 'Wallet', profile: 'Profile', home: 'Home', help: 'Help', signin: 'Sign in', getstarted: 'Get started' },
    kri: { search: 'Wetin yu nid tide?', hello: 'Ɛnitin yu nid. Na wan ples.', food: 'Chop', groceries: 'Maket', basket: 'Basket', home: 'Os' }
  };

  /* ---------- helpers on the catalogue ---------- */
  PLUG.menuFor = (rid) => Object.values(ITEMS).filter(i => i.merchantId === rid);
  PLUG.byKind = (k) => Object.values(M).filter(m => m.kind === k);
})(typeof window !== 'undefined' ? window : globalThis);
