// Philippine regions data for cascading dropdowns
export const REGIONS = [
  {
    name: "National Capital Region (NCR)",
    islandGroup: "Luzon",
    provinces: [
      {
        name: "Metro Manila",
        cities: [
          "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati",
          "Malabon", "Mandaluyong", "Marikina", "Muntinlupa", "Navotas",
          "Parañaque", "Pasay", "Pasig", "San Juan", "Taguig", "Valenzuela"
        ]
      }
    ]
  },
  {
    name: "Cordillera Administrative Region (CAR)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Abra", cities: [] },
      { name: "Apayao", cities: [] },
      { name: "Benguet", cities: ["Baguio"] },
      { name: "Ifugao", cities: [] },
      { name: "Kalinga", cities: ["Tabuk"] },
      { name: "Mountain Province", cities: [] }
    ]
  },
  {
    name: "Ilocos Region (Region I)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Ilocos Norte", cities: ["Batac", "Laoag"] },
      { name: "Ilocos Sur", cities: ["Candon", "Vigan"] },
      { name: "La Union", cities: ["San Fernando"] },
      { name: "Pangasinan", cities: ["Alaminos", "Dagupan", "San Carlos", "Urdaneta"] }
    ]
  },
  {
    name: "Cagayan Valley (Region II)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Batanes", cities: [] },
      { name: "Cagayan", cities: ["Tuguegarao"] },
      { name: "Isabela", cities: ["Cauayan", "Ilagan", "Santiago"] },
      { name: "Nueva Vizcaya", cities: [] },
      { name: "Quirino", cities: [] }
    ]
  },
  {
    name: "Central Luzon (Region III)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Aurora", cities: [] },
      { name: "Bataan", cities: ["Balanga"] },
      { name: "Bulacan", cities: ["Malolos", "Meycauayan", "San Jose del Monte"] },
      { name: "Nueva Ecija", cities: ["Cabanatuan", "Gapan", "Muñoz", "Palayan", "Science City of Muñoz"] },
      { name: "Pampanga", cities: ["Angeles", "Mabalacat", "San Fernando"] },
      { name: "Tarlac", cities: ["Tarlac City"] },
      { name: "Zambales", cities: ["Olongapo"] }
    ]
  },
  {
    name: "CALABARZON (Region IV-A)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Batangas", cities: ["Batangas City", "Lipa", "Santo Tomas", "Tanauan"] },
      { name: "Cavite", cities: ["Bacoor", "Cavite City", "Dasmariñas", "General Trias", "Imus", "Tagaytay", "Trece Martires"] },
      { name: "Laguna", cities: ["Biñan", "Cabuyao", "Calamba", "San Pablo", "San Pedro", "Santa Rosa"] },
      { name: "Quezon", cities: ["Lucena", "Tayabas"] },
      { name: "Rizal", cities: ["Antipolo"] }
    ]
  },
  {
    name: "MIMAROPA (Region IV-B)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Marinduque", cities: [] },
      { name: "Occidental Mindoro", cities: [] },
      { name: "Oriental Mindoro", cities: ["Calapan"] },
      { name: "Palawan", cities: ["Puerto Princesa"] },
      { name: "Romblon", cities: [] }
    ]
  },
  {
    name: "Bicol Region (Region V)",
    islandGroup: "Luzon",
    provinces: [
      { name: "Albay", cities: ["Legazpi", "Ligao", "Tabaco"] },
      { name: "Camarines Norte", cities: [] },
      { name: "Camarines Sur", cities: ["Iriga", "Naga"] },
      { name: "Catanduanes", cities: [] },
      { name: "Masbate", cities: ["Masbate City"] },
      { name: "Sorsogon", cities: ["Sorsogon City"] }
    ]
  },
  {
    name: "Western Visayas (Region VI)",
    islandGroup: "Visayas",
    provinces: [
      { name: "Aklan", cities: [] },
      { name: "Antique", cities: [] },
      { name: "Capiz", cities: ["Roxas"] },
      { name: "Guimaras", cities: [] },
      { name: "Iloilo", cities: ["Iloilo City", "Passi"] },
      { name: "Negros Occidental", cities: ["Bacolod", "Bago", "Cadiz", "Escalante", "Himamaylan", "Kabankalan", "La Carlota", "Sagay", "San Carlos", "Silay", "Sipalay", "Talisay", "Victorias"] }
    ]
  },
  {
    name: "Negros Island Region (NIR)",
    islandGroup: "Visayas",
    provinces: [
      { name: "Negros Occidental", cities: ["Bais", "Bayawan", "Canlaon", "Dumaguete", "Guihulngan", "Tanjay"] },
      { name: "Negros Oriental", cities: [] }
    ]
  },
  {
    name: "Central Visayas (Region VII)",
    islandGroup: "Visayas",
    provinces: [
      { name: "Bohol", cities: ["Tagbilaran"] },
      { name: "Cebu", cities: ["Bogo", "Carcar", "Cebu City", "Danao", "Lapu-Lapu", "Mandaue", "Naga", "Talisay", "Toledo"] },
      { name: "Negros Oriental", cities: [] },
      { name: "Siquijor", cities: [] }
    ]
  },
  {
    name: "Eastern Visayas (Region VIII)",
    islandGroup: "Visayas",
    provinces: [
      { name: "Biliran", cities: [] },
      { name: "Eastern Samar", cities: ["Borongan"] },
      { name: "Leyte", cities: ["Baybay", "Ormoc", "Tacloban"] },
      { name: "Northern Samar", cities: [] },
      { name: "Samar (Western Samar)", cities: ["Calbayog", "Catbalogan"] },
      { name: "Southern Leyte", cities: ["Maasin"] }
    ]
  },
  {
    name: "Zamboanga Peninsula (Region IX)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Zamboanga del Norte", cities: ["Dapitan", "Dipolog"] },
      { name: "Zamboanga del Sur", cities: ["Pagadian"] },
      { name: "Zamboanga Sibugay", cities: [] },
      { name: "Isabela (Basilan)", cities: ["Isabela"] }
    ]
  },
  {
    name: "Northern Mindanao (Region X)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Bukidnon", cities: ["Malaybalay", "Valencia"] },
      { name: "Camiguin", cities: [] },
      { name: "Lanao del Norte", cities: ["Iligan"] },
      { name: "Misamis Occidental", cities: ["Oroquieta", "Ozamiz", "Tangub"] },
      { name: "Misamis Oriental", cities: ["Cagayan de Oro", "El Salvador", "Gingoog"] }
    ]
  },
  {
    name: "Davao Region (Region XI)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Davao de Oro", cities: [] },
      { name: "Davao del Norte", cities: ["Panabo", "Samal", "Tagum"] },
      { name: "Davao del Sur", cities: ["Digos"] },
      { name: "Davao Occidental", cities: [] },
      { name: "Davao Oriental", cities: ["Mati"] },
      { name: "Davao City", cities: ["Davao City"] }
    ]
  },
  {
    name: "SOCCSKSARGEN (Region XII)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Cotabato (North Cotabato)", cities: ["Kidapawan"] },
      { name: "Sarangani", cities: [] },
      { name: "South Cotabato", cities: ["General Santos", "Koronadal"] },
      { name: "Sultan Kudarat", cities: ["Tacurong"] }
    ]
  },
  {
    name: "Caraga Region (Region XIII)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Agusan del Norte", cities: ["Butuan", "Cabadbaran"] },
      { name: "Agusan del Sur", cities: [] },
      { name: "Dinagat Islands", cities: [] },
      { name: "Surigao del Norte", cities: ["Surigao City"] },
      { name: "Surigao del Sur", cities: ["Bislig", "Tandag"] }
    ]
  },
  {
    name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
    islandGroup: "Mindanao",
    provinces: [
      { name: "Basilan", cities: ["Lamitan"] },
      { name: "Lanao del Sur", cities: ["Marawi"] },
      { name: "Maguindanao del Norte", cities: ["Cotabato City"] },
      { name: "Maguindanao del Sur", cities: [] },
      { name: "Sulu", cities: [] },
      { name: "Tawi-Tawi", cities: [] }
    ]
  }
];