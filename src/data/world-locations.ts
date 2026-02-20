// World Locations Data
// Structure: Country → States/Provinces → Cities
// Covers 50+ countries with states & major cities
// Lazy-loaded as a static import (no network overhead, tree-shakeable)

export type LocationData = {
    states: {
        name: string;
        cities: string[];
    }[];
};

export const WORLD_LOCATIONS: Record<string, LocationData> = {
    "Afghanistan": { states: [{ name: "Kabul", cities: ["Kabul"] }, { name: "Herat", cities: ["Herat"] }, { name: "Kandahar", cities: ["Kandahar"] }] },
    "Argentina": { states: [{ name: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata"] }, { name: "Córdoba", cities: ["Córdoba", "Villa Carlos Paz"] }, { name: "Santa Fe", cities: ["Rosario", "Santa Fe"] }, { name: "Mendoza", cities: ["Mendoza"] }] },
    "Australia": {
        states: [
            { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Canberra", "Centralcoast"] },
            { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"] },
            { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"] },
            { name: "Western Australia", cities: ["Perth", "Mandurah", "Bunbury"] },
            { name: "South Australia", cities: ["Adelaide"] },
            { name: "Tasmania", cities: ["Hobart", "Launceston"] },
            { name: "Northern Territory", cities: ["Darwin", "Alice Springs"] },
            { name: "Australian Capital Territory", cities: ["Canberra"] }
        ]
    },
    "Austria": { states: [{ name: "Vienna", cities: ["Vienna"] }, { name: "Styria", cities: ["Graz"] }, { name: "Upper Austria", cities: ["Linz"] }, { name: "Salzburg", cities: ["Salzburg"] }, { name: "Tyrol", cities: ["Innsbruck"] }] },
    "Bangladesh": { states: [{ name: "Dhaka", cities: ["Dhaka", "Narayanganj"] }, { name: "Chittagong", cities: ["Chittagong"] }, { name: "Rajshahi", cities: ["Rajshahi"] }, { name: "Khulna", cities: ["Khulna"] }, { name: "Sylhet", cities: ["Sylhet"] }] },
    "Belgium": { states: [{ name: "Brussels", cities: ["Brussels"] }, { name: "Antwerp", cities: ["Antwerp", "Mechelen"] }, { name: "Ghent", cities: ["Ghent"] }, { name: "Liège", cities: ["Liège"] }] },
    "Brazil": {
        states: [
            { name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos", "Santo André", "Guarulhos"] },
            { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Duque de Caxias"] },
            { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Contagem"] },
            { name: "Bahia", cities: ["Salvador", "Feira de Santana"] },
            { name: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul"] },
            { name: "Paraná", cities: ["Curitiba", "Londrina", "Maringá"] },
            { name: "Pernambuco", cities: ["Recife", "Caruaru"] },
            { name: "Ceará", cities: ["Fortaleza"] },
            { name: "Amazonas", cities: ["Manaus"] },
            { name: "Pará", cities: ["Belém"] }
        ]
    },
    "Canada": {
        states: [
            { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"] },
            { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"] },
            { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna", "Abbotsford"] },
            { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"] },
            { name: "Manitoba", cities: ["Winnipeg", "Brandon"] },
            { name: "Saskatchewan", cities: ["Saskatoon", "Regina"] },
            { name: "Nova Scotia", cities: ["Halifax", "Sydney"] },
            { name: "New Brunswick", cities: ["Moncton", "Fredericton", "Saint John"] },
            { name: "Newfoundland and Labrador", cities: ["St. John's"] },
            { name: "Prince Edward Island", cities: ["Charlottetown"] }
        ]
    },
    "Chile": { states: [{ name: "Santiago", cities: ["Santiago", "Puente Alto", "Antofagasta"] }, { name: "Valparaíso", cities: ["Valparaíso", "Viña del Mar"] }, { name: "Biobío", cities: ["Concepción"] }] },
    "China": {
        states: [
            { name: "Beijing", cities: ["Beijing"] },
            { name: "Shanghai", cities: ["Shanghai"] },
            { name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan", "Foshan"] },
            { name: "Zhejiang", cities: ["Hangzhou", "Ningbo", "Wenzhou"] },
            { name: "Jiangsu", cities: ["Nanjing", "Suzhou", "Wuxi"] },
            { name: "Shandong", cities: ["Jinan", "Qingdao"] },
            { name: "Sichuan", cities: ["Chengdu"] },
            { name: "Hubei", cities: ["Wuhan"] },
            { name: "Hunan", cities: ["Changsha"] },
            { name: "Chongqing", cities: ["Chongqing"] }
        ]
    },
    "Colombia": { states: [{ name: "Cundinamarca", cities: ["Bogotá"] }, { name: "Antioquia", cities: ["Medellín", "Bello"] }, { name: "Valle del Cauca", cities: ["Cali", "Buenaventura"] }, { name: "Atlántico", cities: ["Barranquilla"] }] },
    "Denmark": { states: [{ name: "Capital Region", cities: ["Copenhagen", "Frederiksberg"] }, { name: "Central Denmark", cities: ["Aarhus"] }, { name: "Southern Denmark", cities: ["Odense"] }] },
    "Egypt": { states: [{ name: "Cairo", cities: ["Cairo"] }, { name: "Alexandria", cities: ["Alexandria"] }, { name: "Giza", cities: ["Giza"] }, { name: "Sharm el-Sheikh", cities: ["Sharm el-Sheikh"] }] },
    "Ethiopia": { states: [{ name: "Addis Ababa", cities: ["Addis Ababa"] }, { name: "Oromia", cities: ["Adama"] }] },
    "Finland": { states: [{ name: "Uusimaa", cities: ["Helsinki", "Espoo", "Vantaa"] }, { name: "Pirkanmaa", cities: ["Tampere"] }, { name: "Southwest Finland", cities: ["Turku"] }] },
    "France": {
        states: [
            { name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles"] },
            { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne"] },
            { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon"] },
            { name: "Hauts-de-France", cities: ["Lille", "Amiens"] },
            { name: "Nouvelle-Aquitaine", cities: ["Bordeaux"] },
            { name: "Occitanie", cities: ["Toulouse", "Montpellier"] },
            { name: "Grand Est", cities: ["Strasbourg"] },
            { name: "Normandie", cities: ["Rouen"] }
        ]
    },
    "Germany": {
        states: [
            { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg"] },
            { name: "Baden-Württemberg", cities: ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg"] },
            { name: "North Rhine-Westphalia", cities: ["Cologne", "Dusseldorf", "Essen", "Dortmund", "Duisburg", "Bonn"] },
            { name: "Hesse", cities: ["Frankfurt", "Wiesbaden", "Kassel"] },
            { name: "Berlin", cities: ["Berlin"] },
            { name: "Hamburg", cities: ["Hamburg"] },
            { name: "Saxony", cities: ["Dresden", "Leipzig"] },
            { name: "Brandenburg", cities: ["Potsdam"] },
            { name: "Lower Saxony", cities: ["Hanover", "Braunschweig"] },
            { name: "Rhineland-Palatinate", cities: ["Mainz"] }
        ]
    },
    "Ghana": { states: [{ name: "Greater Accra", cities: ["Accra", "Tema"] }, { name: "Ashanti", cities: ["Kumasi"] }] },
    "Greece": { states: [{ name: "Attica", cities: ["Athens", "Piraeus"] }, { name: "Central Macedonia", cities: ["Thessaloniki"] }] },
    "Hong Kong SAR": { states: [{ name: "Hong Kong Island", cities: ["Central", "Wan Chai", "Causeway Bay"] }, { name: "Kowloon", cities: ["Mong Kok", "Kowloon"] }, { name: "New Territories", cities: ["Sha Tin", "Tsuen Wan"] }] },
    "Hungary": { states: [{ name: "Budapest", cities: ["Budapest"] }, { name: "Pest County", cities: ["Érd", "Miskolc"] }] },
    "India": {
        states: [
            { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry"] },
            { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun"] },
            { name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"] },
            { name: "Bihar", cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"] },
            { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg"] },
            { name: "Delhi", cities: ["New Delhi", "Delhi", "Noida", "Gurugram", "Faridabad"] },
            { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"] },
            { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar"] },
            { name: "Haryana", cities: ["Gurugram", "Faridabad", "Chandigarh", "Ambala", "Rohtak", "Panipat", "Hisar"] },
            { name: "Himachal Pradesh", cities: ["Shimla", "Dharamshala", "Manali", "Solan"] },
            { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"] },
            { name: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Dharwad"] },
            { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad"] },
            { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"] },
            { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Navi Mumbai", "Solapur", "Kolhapur"] },
            { name: "Manipur", cities: ["Imphal"] },
            { name: "Meghalaya", cities: ["Shillong"] },
            { name: "Mizoram", cities: ["Aizawl"] },
            { name: "Nagaland", cities: ["Kohima", "Dimapur"] },
            { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur"] },
            { name: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Chandigarh"] },
            { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota", "Bikaner"] },
            { name: "Sikkim", cities: ["Gangtok"] },
            { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"] },
            { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Secunderabad"] },
            { name: "Tripura", cities: ["Agartala"] },
            { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Ghaziabad", "Prayagraj", "Meerut", "Bareilly"] },
            { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Roorkee", "Nainital"] },
            { name: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda"] }
        ]
    },
    "Indonesia": {
        states: [
            { name: "DKI Jakarta", cities: ["Jakarta", "Bekasi", "Depok", "Tangerang"] },
            { name: "West Java", cities: ["Bandung", "Bogor", "Cimahi"] },
            { name: "East Java", cities: ["Surabaya", "Malang", "Kediri"] },
            { name: "Central Java", cities: ["Semarang", "Solo", "Yogyakarta"] },
            { name: "North Sumatra", cities: ["Medan"] },
            { name: "South Sulawesi", cities: ["Makassar"] }
        ]
    },
    "Iran": { states: [{ name: "Tehran", cities: ["Tehran", "Karaj"] }, { name: "Isfahan", cities: ["Isfahan"] }, { name: "Mashhad", cities: ["Mashhad"] }, { name: "Shiraz", cities: ["Shiraz"] }] },
    "Iraq": { states: [{ name: "Baghdad", cities: ["Baghdad"] }, { name: "Basra", cities: ["Basra"] }, { name: "Mosul", cities: ["Mosul"] }] },
    "Ireland": { states: [{ name: "Leinster", cities: ["Dublin", "Dún Laoghaire"] }, { name: "Munster", cities: ["Cork", "Limerick"] }, { name: "Connacht", cities: ["Galway"] }] },
    "Israel": { states: [{ name: "Tel Aviv", cities: ["Tel Aviv", "Ramat Gan", "Petah Tikva"] }, { name: "Jerusalem", cities: ["Jerusalem"] }, { name: "Haifa", cities: ["Haifa"] }] },
    "Italy": {
        states: [
            { name: "Lombardy", cities: ["Milan", "Brescia", "Bergamo"] },
            { name: "Lazio", cities: ["Rome"] },
            { name: "Campania", cities: ["Naples", "Salerno"] },
            { name: "Veneto", cities: ["Venice", "Verona", "Padua"] },
            { name: "Emilia-Romagna", cities: ["Bologna", "Modena"] },
            { name: "Tuscany", cities: ["Florence", "Pisa", "Siena"] },
            { name: "Piedmont", cities: ["Turin"] },
            { name: "Sicily", cities: ["Palermo", "Catania"] }
        ]
    },
    "Japan": {
        states: [
            { name: "Tokyo", cities: ["Tokyo", "Shinjuku", "Shibuya", "Minato"] },
            { name: "Osaka", cities: ["Osaka", "Sakai", "Higashiosaka"] },
            { name: "Kanagawa", cities: ["Yokohama", "Kawasaki", "Sagamihara"] },
            { name: "Aichi", cities: ["Nagoya", "Toyota"] },
            { name: "Saitama", cities: ["Saitama", "Kawaguchi"] },
            { name: "Chiba", cities: ["Chiba"] },
            { name: "Hyogo", cities: ["Kobe", "Himeji"] },
            { name: "Hokkaido", cities: ["Sapporo"] },
            { name: "Fukuoka", cities: ["Fukuoka"] },
            { name: "Kyoto", cities: ["Kyoto"] }
        ]
    },
    "Jordan": { states: [{ name: "Amman", cities: ["Amman"] }, { name: "Zarqa", cities: ["Zarqa"] }] },
    "Kenya": { states: [{ name: "Nairobi County", cities: ["Nairobi"] }, { name: "Mombasa County", cities: ["Mombasa"] }, { name: "Nakuru County", cities: ["Nakuru"] }] },
    "Kuwait": { states: [{ name: "Kuwait City", cities: ["Kuwait City", "Ahmadi"] }, { name: "Hawalli", cities: ["Hawalli", "Salmiya"] }] },
    "Lebanon": { states: [{ name: "Beirut", cities: ["Beirut"] }, { name: "North Lebanon", cities: ["Tripoli"] }] },
    "Malaysia": {
        states: [
            { name: "Kuala Lumpur", cities: ["Kuala Lumpur"] },
            { name: "Selangor", cities: ["Petaling Jaya", "Shah Alam", "Klang", "Subang Jaya", "Ampang"] },
            { name: "Penang", cities: ["George Town", "Butterworth"] },
            { name: "Johor", cities: ["Johor Bahru", "Batu Pahat"] },
            { name: "Sabah", cities: ["Kota Kinabalu"] },
            { name: "Sarawak", cities: ["Kuching"] }
        ]
    },
    "Mexico": {
        states: [
            { name: "Mexico City", cities: ["Mexico City"] },
            { name: "Jalisco", cities: ["Guadalajara", "Zapopan"] },
            { name: "Nuevo León", cities: ["Monterrey", "San Nicolás de los Garza"] },
            { name: "State of Mexico", cities: ["Ecatepec", "Naucalpan", "Tlalnepantla"] },
            { name: "Puebla", cities: ["Puebla", "Tehuacán"] },
            { name: "Guanajuato", cities: ["León", "Irapuato"] }
        ]
    },
    "Morocco": { states: [{ name: "Casablanca-Settat", cities: ["Casablanca", "Settat"] }, { name: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé"] }, { name: "Marrakesh-Safi", cities: ["Marrakesh"] }, { name: "Fès-Meknès", cities: ["Fès"] }] },
    "Nepal": { states: [{ name: "Bagmati", cities: ["Kathmandu", "Lalitpur", "Bhaktapur"] }, { name: "Gandaki", cities: ["Pokhara"] }] },
    "Netherlands": { states: [{ name: "North Holland", cities: ["Amsterdam", "Haarlem"] }, { name: "South Holland", cities: ["Rotterdam", "The Hague", "Leiden"] }, { name: "Utrecht", cities: ["Utrecht"] }, { name: "Gelderland", cities: ["Nijmegen", "Arnhem"] }] },
    "New Zealand": { states: [{ name: "Auckland", cities: ["Auckland", "North Shore", "Waitakere"] }, { name: "Wellington", cities: ["Wellington", "Porirua"] }, { name: "Canterbury", cities: ["Christchurch"] }, { name: "Waikato", cities: ["Hamilton"] }] },
    "Nigeria": { states: [{ name: "Lagos", cities: ["Lagos", "Ikeja"] }, { name: "Abuja", cities: ["Abuja"] }, { name: "Kano", cities: ["Kano"] }, { name: "Rivers", cities: ["Port Harcourt"] }, { name: "Oyo", cities: ["Ibadan"] }] },
    "Norway": { states: [{ name: "Oslo", cities: ["Oslo"] }, { name: "Vestland", cities: ["Bergen"] }, { name: "Trøndelag", cities: ["Trondheim"] }] },
    "Oman": { states: [{ name: "Muscat", cities: ["Muscat", "Salalah", "Seeb"] }, { name: "Dhofar", cities: ["Salalah"] }] },
    "Pakistan": {
        states: [
            { name: "Punjab", cities: ["Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Islamabad"] },
            { name: "Sindh", cities: ["Karachi", "Hyderabad", "Sukkur"] },
            { name: "Khyber Pakhtunkhwa", cities: ["Peshawar", "Abbottabad"] },
            { name: "Balochistan", cities: ["Quetta"] },
            { name: "Islamabad Capital Territory", cities: ["Islamabad"] }
        ]
    },
    "Peru": { states: [{ name: "Lima", cities: ["Lima", "Callao"] }, { name: "Arequipa", cities: ["Arequipa"] }, { name: "La Libertad", cities: ["Trujillo"] }, { name: "Lambayeque", cities: ["Chiclayo"] }] },
    "Philippines": {
        states: [
            { name: "Metro Manila", cities: ["Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong", "Pasay"] },
            { name: "Cebu", cities: ["Cebu City", "Mandaue", "Lapu-Lapu"] },
            { name: "Davao", cities: ["Davao City"] },
            { name: "Laguna", cities: ["Calamba", "Santa Rosa"] }
        ]
    },
    "Poland": { states: [{ name: "Masovian", cities: ["Warsaw"] }, { name: "Lesser Poland", cities: ["Kraków"] }, { name: "Lower Silesia", cities: ["Wrocław"] }, { name: "Pomerania", cities: ["Gdańsk"] }] },
    "Portugal": { states: [{ name: "Lisbon", cities: ["Lisbon"] }, { name: "Porto", cities: ["Porto", "Vila Nova de Gaia"] }, { name: "Algarve", cities: ["Faro", "Portimão"] }] },
    "Qatar": { states: [{ name: "Ad Dawhah", cities: ["Doha", "Al Wakrah"] }, { name: "Al Wakrah", cities: ["Al Wakrah"] }] },
    "Romania": { states: [{ name: "Bucharest", cities: ["Bucharest"] }, { name: "Cluj", cities: ["Cluj-Napoca"] }, { name: "Timis", cities: ["Timișoara"] }] },
    "Russia": {
        states: [
            { name: "Moscow Oblast", cities: ["Moscow", "Mytishchi", "Khimki"] },
            { name: "Saint Petersburg", cities: ["Saint Petersburg"] },
            { name: "Novosibirsk Oblast", cities: ["Novosibirsk"] },
            { name: "Yekaterinburg Oblast", cities: ["Yekaterinburg"] },
            { name: "Krasnodar Krai", cities: ["Krasnodar", "Sochi"] }
        ]
    },
    "Saudi Arabia": {
        states: [
            { name: "Riyadh Region", cities: ["Riyadh", "Kharj"] },
            { name: "Mecca Region", cities: ["Jeddah", "Mecca", "Taif"] },
            { name: "Eastern Province", cities: ["Dammam", "Al Khobar", "Dhahran"] },
            { name: "Medina Region", cities: ["Medina"] }
        ]
    },
    "Singapore": { states: [{ name: "Central Region", cities: ["Singapore", "Orchard", "Toa Payoh"] }, { name: "East Region", cities: ["Tampines", "Bedok", "Pasir Ris"] }, { name: "West Region", cities: ["Jurong", "Bukit Batok"] }] },
    "South Africa": {
        states: [
            { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Soweto", "Midrand"] },
            { name: "Western Cape", cities: ["Cape Town", "Stellenbosch"] },
            { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg"] },
            { name: "Eastern Cape", cities: ["Port Elizabeth", "East London"] }
        ]
    },
    "South Korea": {
        states: [
            { name: "Seoul", cities: ["Seoul"] },
            { name: "Gyeonggi-do", cities: ["Suwon", "Seongnam", "Bucheon", "Ansan"] },
            { name: "Busan", cities: ["Busan"] },
            { name: "Incheon", cities: ["Incheon"] },
            { name: "Daegu", cities: ["Daegu"] },
            { name: "Daejeon", cities: ["Daejeon"] }
        ]
    },
    "Spain": {
        states: [
            { name: "Community of Madrid", cities: ["Madrid", "Alcalá de Henares", "Getafe"] },
            { name: "Catalonia", cities: ["Barcelona", "Terrassa", "Sabadell"] },
            { name: "Andalusia", cities: ["Seville", "Málaga", "Granada", "Córdoba"] },
            { name: "Valencian Community", cities: ["Valencia", "Alicante"] },
            { name: "Basque Country", cities: ["Bilbao", "Vitoria-Gasteiz"] }
        ]
    },
    "Sri Lanka": { states: [{ name: "Western Province", cities: ["Colombo", "Sri Jayawardenepura Kotte"] }, { name: "Central Province", cities: ["Kandy"] }, { name: "Southern Province", cities: ["Galle"] }] },
    "Sweden": { states: [{ name: "Stockholm County", cities: ["Stockholm"] }, { name: "Västra Götaland", cities: ["Gothenburg"] }, { name: "Skåne", cities: ["Malmö"] }] },
    "Switzerland": { states: [{ name: "Zürich", cities: ["Zürich", "Winterthur"] }, { name: "Geneva", cities: ["Geneva"] }, { name: "Bern", cities: ["Bern"] }, { name: "Basel-City", cities: ["Basel"] }] },
    "Taiwan": { states: [{ name: "Taipei City", cities: ["Taipei"] }, { name: "New Taipei City", cities: ["New Taipei"] }, { name: "Taichung City", cities: ["Taichung"] }, { name: "Kaohsiung City", cities: ["Kaohsiung"] }] },
    "Tanzania": { states: [{ name: "Dar es Salaam", cities: ["Dar es Salaam"] }, { name: "Arusha", cities: ["Arusha"] }] },
    "Thailand": {
        states: [
            { name: "Bangkok", cities: ["Bangkok", "Nonthaburi"] },
            { name: "Chiang Mai", cities: ["Chiang Mai"] },
            { name: "Chonburi", cities: ["Pattaya", "Chonburi"] }
        ]
    },
    "Turkey": {
        states: [
            { name: "Istanbul", cities: ["Istanbul"] },
            { name: "Ankara", cities: ["Ankara"] },
            { name: "Izmir", cities: ["Izmir"] },
            { name: "Bursa", cities: ["Bursa"] },
            { name: "Antalya", cities: ["Antalya"] }
        ]
    },
    "Ukraine": { states: [{ name: "Kyiv", cities: ["Kyiv"] }, { name: "Kharkiv", cities: ["Kharkiv"] }, { name: "Lviv", cities: ["Lviv"] }, { name: "Odessa", cities: ["Odessa"] }] },
    "United Arab Emirates": {
        states: [
            { name: "Dubai", cities: ["Dubai", "Deira", "Bur Dubai", "Jumeirah", "Downtown Dubai", "Business Bay", "JLT", "JBR", "Silicon Oasis"] },
            { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain", "Khalifa City"] },
            { name: "Sharjah", cities: ["Sharjah"] },
            { name: "Ajman", cities: ["Ajman"] },
            { name: "Ras al-Khaimah", cities: ["Ras al-Khaimah"] },
            { name: "Fujairah", cities: ["Fujairah"] },
            { name: "Umm al-Quwain", cities: ["Umm al-Quwain"] }
        ]
    },
    "United Kingdom": {
        states: [
            { name: "England", cities: ["London", "Birmingham", "Manchester", "Leeds", "Sheffield", "Bristol", "Liverpool", "Newcastle", "Nottingham", "Leicester", "Coventry", "Bradford", "Milton Keynes", "Edinburgh"] },
            { name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"] },
            { name: "Wales", cities: ["Cardiff", "Swansea", "Newport"] },
            { name: "Northern Ireland", cities: ["Belfast", "Derry"] }
        ]
    },
    "United States": {
        states: [
            { name: "Alabama", cities: ["Birmingham", "Huntsville", "Montgomery", "Mobile"] },
            { name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau"] },
            { name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Tempe"] },
            { name: "Arkansas", cities: ["Little Rock", "Fayetteville"] },
            { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Oakland", "Fresno", "Long Beach", "Irvine", "Santa Ana", "Anaheim", "Riverside", "Santa Barbara", "Palo Alto", "Berkeley"] },
            { name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Boulder"] },
            { name: "Connecticut", cities: ["Hartford", "New Haven", "Bridgeport"] },
            { name: "Delaware", cities: ["Wilmington", "Dover"] },
            { name: "Florida", cities: ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale", "Boca Raton", "Tallahassee"] },
            { name: "Georgia", cities: ["Atlanta", "Augusta", "Columbus", "Savannah"] },
            { name: "Hawaii", cities: ["Honolulu", "Kailua"] },
            { name: "Idaho", cities: ["Boise", "Nampa"] },
            { name: "Illinois", cities: ["Chicago", "Aurora", "Springfield", "Rockford", "Naperville"] },
            { name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville"] },
            { name: "Iowa", cities: ["Des Moines", "Cedar Rapids"] },
            { name: "Kansas", cities: ["Wichita", "Kansas City", "Topeka"] },
            { name: "Kentucky", cities: ["Louisville", "Lexington"] },
            { name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport"] },
            { name: "Maine", cities: ["Portland", "Augusta"] },
            { name: "Maryland", cities: ["Baltimore", "Annapolis", "Frederick"] },
            { name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Cambridge"] },
            { name: "Michigan", cities: ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing"] },
            { name: "Minnesota", cities: ["Minneapolis", "Saint Paul", "Rochester"] },
            { name: "Mississippi", cities: ["Jackson", "Biloxi"] },
            { name: "Missouri", cities: ["Saint Louis", "Kansas City", "Springfield"] },
            { name: "Montana", cities: ["Billings", "Missoula"] },
            { name: "Nebraska", cities: ["Omaha", "Lincoln"] },
            { name: "Nevada", cities: ["Las Vegas", "Reno", "Henderson"] },
            { name: "New Hampshire", cities: ["Manchester", "Concord"] },
            { name: "New Jersey", cities: ["Newark", "Jersey City", "Paterson", "Edison", "Trenton"] },
            { name: "New Mexico", cities: ["Albuquerque", "Santa Fe"] },
            { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"] },
            { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville"] },
            { name: "North Dakota", cities: ["Fargo", "Bismarck"] },
            { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
            { name: "Oklahoma", cities: ["Oklahoma City", "Tulsa"] },
            { name: "Oregon", cities: ["Portland", "Eugene", "Salem"] },
            { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie"] },
            { name: "Rhode Island", cities: ["Providence"] },
            { name: "South Carolina", cities: ["Columbia", "Charleston", "Greenville"] },
            { name: "South Dakota", cities: ["Sioux Falls", "Rapid City"] },
            { name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga"] },
            { name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Plano", "Lubbock"] },
            { name: "Utah", cities: ["Salt Lake City", "West Valley City", "Provo"] },
            { name: "Vermont", cities: ["Burlington", "Montpelier"] },
            { name: "Virginia", cities: ["Virginia Beach", "Norfolk", "Richmond", "Chesapeake", "Arlington", "Roanoke"] },
            { name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Bellevue", "Redmond", "Kirkland", "Everett"] },
            { name: "West Virginia", cities: ["Charleston", "Huntington"] },
            { name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay"] },
            { name: "Wyoming", cities: ["Cheyenne", "Casper"] }
        ]
    },
    "Venezuela": { states: [{ name: "Capital District", cities: ["Caracas"] }, { name: "Zulia", cities: ["Maracaibo"] }, { name: "Carabobo", cities: ["Valencia"] }] },
    "Vietnam": { states: [{ name: "Ho Chi Minh City", cities: ["Ho Chi Minh City"] }, { name: "Hanoi", cities: ["Hanoi"] }, { name: "Da Nang", cities: ["Da Nang"] }] },
    "Yemen": { states: [{ name: "Amanat Al Asimah", cities: ["Sanaa"] }, { name: "Aden", cities: ["Aden"] }] }
};

export const ALL_COUNTRIES = Object.keys(WORLD_LOCATIONS).sort();

export function getStates(country: string): string[] {
    return (WORLD_LOCATIONS[country]?.states || []).map(s => s.name).sort();
}

export function getCities(country: string, state: string): string[] {
    const stateData = WORLD_LOCATIONS[country]?.states.find(s => s.name === state);
    return (stateData?.cities || []).sort();
}
