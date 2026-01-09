export const products = [
  {
    id: 1,
    name: "Miniket Rice Premium",
    category: "Grocery",
    price: 65,
    originalPrice: 70, // <--- New field for discount calculation
    unit: "kg",
    image: "https://chaldn.com/_mpimage/chinigura-rice-premium-1-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D48071&q=best&v=1&m=400&webp=1",
    stock: 50
  },
  {
    id: 2,
    name: "Rupchanda Soybean Oil",
    category: "Grocery",
    price: 185,
    originalPrice: 190,
    unit: "ltr",
    image: "https://chaldn.com/_mpimage/rupchanda-soybean-oil-2-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D129481&q=best&v=1",
    stock: 20
  },
  {
    id: 3,
    name: "Coca-Cola",
    category: "Beverage",
    price: 60,
    originalPrice: 60, // No discount
    unit: "bottle",
    image: "https://chaldn.com/_mpimage/coca-cola-250-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D146979&q=best&v=1&m=400&webp=1",
    stock: 100
  },
  {
    id: 4,
    name: "ACI Pure Salt",
    category: "Grocery",
    price: 40,
    originalPrice: 45,
    unit: "kg",
    image: "https://chaldn.com/_mpimage/aci-pure-salt-1-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D47100&q=best&v=1&m=400&webp=1",
    stock: 200
  },
  {
    id: 5,
    name: "Fresh Eggs (1 Dozen)",
    category: "Grocery",
    price: 140,
    originalPrice: 150,
    unit: "12 pcs",
    image: "https://chaldn.com/_mpimage/fresh-chicken-eggs-layer-12-pcs?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D103631&q=best&v=1",
    stock: 50
  },
  {
    id: 6,
    name: "Liquid Milk (Pran)",
    category: "Grocery",
    price: 90,
    originalPrice: 95,
    unit: "1 ltr",
    image: "https://chaldn.com/_mpimage/pran-uht-milk-1-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D72036&q=best&v=1",
    stock: 40
  },
  {
    id: 7,
    name: "Bombay Sweets Potato Crackers",
    category: "Grocery",
    price: 25,
    originalPrice: 25,
    unit: "pack",
    image: "https://chaldn.com/_mpimage/bombay-sweets-potato-crackers-22-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D116843&q=best&v=1",
    stock: 100
  },
   {
    id: 8,
    name: "Napa Extra",
    category: "Pharmacy",
    price: 25,
    originalPrice: 30,
    unit: "12 pcs",
    image: "https://chaldn.com/_mpimage/napa-tablet-500mg-10-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D106095&q=low&v=1&m=400&webp=1"
  },
  {
    id: 9,
    name: "Ghani Mustard Oil",
    category: "Grocery",
    price: 325,
    originalPrice: 330,
    unit: "1 pcs",
    image: "https://chaldn.com/_mpimage/ghani-mustard-oil-1-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D98987&q=best&v=1&m=400&webp=1",
    stock: 100
  },
  {
    id: 10,
    name: "Roja Peri Peri Fish Nugget",
    category: "Grocery",
    price: 230,
    originalPrice: 230,
    unit: "1 pcs",
    image: "https://chaldn.com/_mpimage/roja-peri-peri-fish-nugget-240-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D114546&q=best&v=1&m=400&m=400&webp=1",
    stock: 100
  },
  {
    id: 11,
    name: "Carnation Milk Thai",
    category: "Grocery",
    price: 299,
    originalPrice: 299,
    unit: "405 gm",
    image: "https://chaldn.com/_mpimage/carnation-milk-thai-405-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D126596&q=best&v=1&m=400&webp=1",
    stock: 20
  }
  ,
  {
    id: 101,
    name: "Uromax-D Capsule 0.4mg+0.5mg",
    category: "Pharmacy",
    price: 115,
    originalPrice: 115,
    unit: "5 capsules",
    image: "https://chaldn.com/_mpimage/uromax-d-capsule-04mg05mg-5capsules?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D129303&q=best&v=1&m=400&webp=1",
    stock: 50
  },
  {
    id: 102,
    name: "Comet Tablet 850mg",
    category: "Pharmacy",
    price: 60,
    originalPrice: 60,
    unit: "10 tablets",
    image: "https://chaldn.com/_mpimage/comet-tablet-850mg-10-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D106837&q=low&v=1&m=400&webp=1",
    stock: 100
  },
  {
    id: 103,
    name: "Fexo Tablet 120mg",
    category: "Pharmacy",
    price: 90,
    originalPrice: 90,
    unit: "10 tablets",
    image: "https://chaldn.com/_mpimage/fexo-tablet-120mg-10-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D106911&q=low&v=1&m=400&webp=1",
    stock: 100
  },
  {
    id: 104,
    name: "Seclo Capsule 20mg",
    category: "Pharmacy",
    price: 60,
    originalPrice: 60,
    unit: "10 capsules",
    image: "https://chaldn.com/_mpimage/seclo-capsule-20mg-10-capsules?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D156244&q=low&v=1&m=400&webp=1",
    stock: 150
  },
  {
    id: 105,
    name: "Rosuva Tablet 5mg",
    category: "Pharmacy",
    price: 120,
    originalPrice: 120,
    unit: "10 tablets",
    image: "https://chaldn.com/_mpimage/rosuva-tablet-5mg-10-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D102979&q=low&v=1&m=400&webp=1",
    stock: 80
  },
  {
    id: 106,
    name: "Napa Extend Tablet 665mg",
    category: "Pharmacy",
    price: 24,
    originalPrice: 24,
    unit: "12 tablets",
    image: "https://chaldn.com/_mpimage/napa-extend-tablet-665mg-12-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D106090&q=low&v=1&m=400&webp=1",
    stock: 200
  }
];



