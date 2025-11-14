/**
 * Information about a country including its currency and metadata.
 */
export interface CountryInfo {
  name: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  continent: string;
  capital?: string;
  languages?: string[];
}

/**
 * Comprehensive registry of countries and their associated currencies.
 *
 * This module provides detailed information about countries worldwide,
 * including their official currencies, codes, and geographical data.
 * Follows ISO 3166-1 (country codes) and ISO 4217 (currency codes) standards.
 */
export class CountryRegistry {
  private static readonly COUNTRIES: ReadonlyMap<string, CountryInfo> = new Map([
    // North America
    [
      'US',
      {
        name: 'United States',
        iso2: 'US',
        iso3: 'USA',
        numericCode: '840',
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencySymbol: '$',
        continent: 'North America',
        capital: 'Washington, D.C.',
        languages: ['English'],
      },
    ],
    [
      'CA',
      {
        name: 'Canada',
        iso2: 'CA',
        iso3: 'CAN',
        numericCode: '124',
        currencyCode: 'CAD',
        currencyName: 'Canadian Dollar',
        currencySymbol: '$',
        continent: 'North America',
        capital: 'Ottawa',
        languages: ['English', 'French'],
      },
    ],
    [
      'MX',
      {
        name: 'Mexico',
        iso2: 'MX',
        iso3: 'MEX',
        numericCode: '484',
        currencyCode: 'MXN',
        currencyName: 'Mexican Peso',
        currencySymbol: '$',
        continent: 'North America',
        capital: 'Mexico City',
        languages: ['Spanish'],
      },
    ],

    // Central America
    [
      'GT',
      {
        name: 'Guatemala',
        iso2: 'GT',
        iso3: 'GTM',
        numericCode: '320',
        currencyCode: 'GTQ',
        currencyName: 'Guatemalan Quetzal',
        currencySymbol: 'Q',
        continent: 'Central America',
        capital: 'Guatemala City',
        languages: ['Spanish'],
      },
    ],
    [
      'BZ',
      {
        name: 'Belize',
        iso2: 'BZ',
        iso3: 'BLZ',
        numericCode: '084',
        currencyCode: 'BZD',
        currencyName: 'Belize Dollar',
        currencySymbol: '$',
        continent: 'Central America',
        capital: 'Belmopan',
        languages: ['English'],
      },
    ],
    [
      'SV',
      {
        name: 'El Salvador',
        iso2: 'SV',
        iso3: 'SLV',
        numericCode: '222',
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencySymbol: '$',
        continent: 'Central America',
        capital: 'San Salvador',
        languages: ['Spanish'],
      },
    ],
    [
      'HN',
      {
        name: 'Honduras',
        iso2: 'HN',
        iso3: 'HND',
        numericCode: '340',
        currencyCode: 'HNL',
        currencyName: 'Honduran Lempira',
        currencySymbol: 'L',
        continent: 'Central America',
        capital: 'Tegucigalpa',
        languages: ['Spanish'],
      },
    ],
    [
      'NI',
      {
        name: 'Nicaragua',
        iso2: 'NI',
        iso3: 'NIC',
        numericCode: '558',
        currencyCode: 'NIO',
        currencyName: 'Nicaraguan Córdoba',
        currencySymbol: 'C$',
        continent: 'Central America',
        capital: 'Managua',
        languages: ['Spanish'],
      },
    ],
    [
      'CR',
      {
        name: 'Costa Rica',
        iso2: 'CR',
        iso3: 'CRI',
        numericCode: '188',
        currencyCode: 'CRC',
        currencyName: 'Costa Rican Colón',
        currencySymbol: '₡',
        continent: 'Central America',
        capital: 'San José',
        languages: ['Spanish'],
      },
    ],
    [
      'PA',
      {
        name: 'Panama',
        iso2: 'PA',
        iso3: 'PAN',
        numericCode: '591',
        currencyCode: 'PAB',
        currencyName: 'Panamanian Balboa',
        currencySymbol: 'B/.',
        continent: 'Central America',
        capital: 'Panama City',
        languages: ['Spanish'],
      },
    ],

    // Caribbean
    [
      'CU',
      {
        name: 'Cuba',
        iso2: 'CU',
        iso3: 'CUB',
        numericCode: '192',
        currencyCode: 'CUP',
        currencyName: 'Cuban Peso',
        currencySymbol: '$',
        continent: 'Caribbean',
        capital: 'Havana',
        languages: ['Spanish'],
      },
    ],
    [
      'JM',
      {
        name: 'Jamaica',
        iso2: 'JM',
        iso3: 'JAM',
        numericCode: '388',
        currencyCode: 'JMD',
        currencyName: 'Jamaican Dollar',
        currencySymbol: '$',
        continent: 'Caribbean',
        capital: 'Kingston',
        languages: ['English'],
      },
    ],
    [
      'HT',
      {
        name: 'Haiti',
        iso2: 'HT',
        iso3: 'HTI',
        numericCode: '332',
        currencyCode: 'HTG',
        currencyName: 'Haitian Gourde',
        currencySymbol: 'G',
        continent: 'Caribbean',
        capital: 'Port-au-Prince',
        languages: ['French', 'Haitian Creole'],
      },
    ],
    [
      'DO',
      {
        name: 'Dominican Republic',
        iso2: 'DO',
        iso3: 'DOM',
        numericCode: '214',
        currencyCode: 'DOP',
        currencyName: 'Dominican Peso',
        currencySymbol: '$',
        continent: 'Caribbean',
        capital: 'Santo Domingo',
        languages: ['Spanish'],
      },
    ],

    // South America
    [
      'CO',
      {
        name: 'Colombia',
        iso2: 'CO',
        iso3: 'COL',
        numericCode: '170',
        currencyCode: 'COP',
        currencyName: 'Colombian Peso',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Bogotá',
        languages: ['Spanish'],
      },
    ],
    [
      'VE',
      {
        name: 'Venezuela',
        iso2: 'VE',
        iso3: 'VEN',
        numericCode: '862',
        currencyCode: 'VES',
        currencyName: 'Venezuelan Bolívar',
        currencySymbol: 'Bs.',
        continent: 'South America',
        capital: 'Caracas',
        languages: ['Spanish'],
      },
    ],
    [
      'BR',
      {
        name: 'Brazil',
        iso2: 'BR',
        iso3: 'BRA',
        numericCode: '076',
        currencyCode: 'BRL',
        currencyName: 'Brazilian Real',
        currencySymbol: 'R$',
        continent: 'South America',
        capital: 'Brasília',
        languages: ['Portuguese'],
      },
    ],
    [
      'PE',
      {
        name: 'Peru',
        iso2: 'PE',
        iso3: 'PER',
        numericCode: '604',
        currencyCode: 'PEN',
        currencyName: 'Peruvian Sol',
        currencySymbol: 'S/',
        continent: 'South America',
        capital: 'Lima',
        languages: ['Spanish'],
      },
    ],
    [
      'EC',
      {
        name: 'Ecuador',
        iso2: 'EC',
        iso3: 'ECU',
        numericCode: '218',
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Quito',
        languages: ['Spanish'],
      },
    ],
    [
      'BO',
      {
        name: 'Bolivia',
        iso2: 'BO',
        iso3: 'BOL',
        numericCode: '068',
        currencyCode: 'BOB',
        currencyName: 'Bolivian Boliviano',
        currencySymbol: 'Bs.',
        continent: 'South America',
        capital: 'Sucre',
        languages: ['Spanish', 'Quechua', 'Aymara'],
      },
    ],
    [
      'PY',
      {
        name: 'Paraguay',
        iso2: 'PY',
        iso3: 'PRY',
        numericCode: '600',
        currencyCode: 'PYG',
        currencyName: 'Paraguayan Guaraní',
        currencySymbol: '₲',
        continent: 'South America',
        capital: 'Asunción',
        languages: ['Spanish', 'Guaraní'],
      },
    ],
    [
      'CL',
      {
        name: 'Chile',
        iso2: 'CL',
        iso3: 'CHL',
        numericCode: '152',
        currencyCode: 'CLP',
        currencyName: 'Chilean Peso',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Santiago',
        languages: ['Spanish'],
      },
    ],
    [
      'AR',
      {
        name: 'Argentina',
        iso2: 'AR',
        iso3: 'ARG',
        numericCode: '032',
        currencyCode: 'ARS',
        currencyName: 'Argentine Peso',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Buenos Aires',
        languages: ['Spanish'],
      },
    ],
    [
      'UY',
      {
        name: 'Uruguay',
        iso2: 'UY',
        iso3: 'URY',
        numericCode: '858',
        currencyCode: 'UYU',
        currencyName: 'Uruguayan Peso',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Montevideo',
        languages: ['Spanish'],
      },
    ],
    [
      'GY',
      {
        name: 'Guyana',
        iso2: 'GY',
        iso3: 'GUY',
        numericCode: '328',
        currencyCode: 'GYD',
        currencyName: 'Guyanese Dollar',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Georgetown',
        languages: ['English'],
      },
    ],
    [
      'SR',
      {
        name: 'Suriname',
        iso2: 'SR',
        iso3: 'SUR',
        numericCode: '740',
        currencyCode: 'SRD',
        currencyName: 'Surinamese Dollar',
        currencySymbol: '$',
        continent: 'South America',
        capital: 'Paramaribo',
        languages: ['Dutch'],
      },
    ],

    // Western Europe
    [
      'GB',
      {
        name: 'United Kingdom',
        iso2: 'GB',
        iso3: 'GBR',
        numericCode: '826',
        currencyCode: 'GBP',
        currencyName: 'British Pound',
        currencySymbol: '£',
        continent: 'Europe',
        capital: 'London',
        languages: ['English'],
      },
    ],
    [
      'IE',
      {
        name: 'Ireland',
        iso2: 'IE',
        iso3: 'IRL',
        numericCode: '372',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Dublin',
        languages: ['English', 'Irish'],
      },
    ],
    [
      'FR',
      {
        name: 'France',
        iso2: 'FR',
        iso3: 'FRA',
        numericCode: '250',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Paris',
        languages: ['French'],
      },
    ],
    [
      'ES',
      {
        name: 'Spain',
        iso2: 'ES',
        iso3: 'ESP',
        numericCode: '724',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Madrid',
        languages: ['Spanish'],
      },
    ],
    [
      'PT',
      {
        name: 'Portugal',
        iso2: 'PT',
        iso3: 'PRT',
        numericCode: '620',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Lisbon',
        languages: ['Portuguese'],
      },
    ],
    [
      'IT',
      {
        name: 'Italy',
        iso2: 'IT',
        iso3: 'ITA',
        numericCode: '380',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Rome',
        languages: ['Italian'],
      },
    ],
    [
      'DE',
      {
        name: 'Germany',
        iso2: 'DE',
        iso3: 'DEU',
        numericCode: '276',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Berlin',
        languages: ['German'],
      },
    ],
    [
      'NL',
      {
        name: 'Netherlands',
        iso2: 'NL',
        iso3: 'NLD',
        numericCode: '528',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Amsterdam',
        languages: ['Dutch'],
      },
    ],
    [
      'BE',
      {
        name: 'Belgium',
        iso2: 'BE',
        iso3: 'BEL',
        numericCode: '056',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Brussels',
        languages: ['Dutch', 'French', 'German'],
      },
    ],
    [
      'LU',
      {
        name: 'Luxembourg',
        iso2: 'LU',
        iso3: 'LUX',
        numericCode: '442',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Luxembourg',
        languages: ['Luxembourgish', 'French', 'German'],
      },
    ],
    [
      'CH',
      {
        name: 'Switzerland',
        iso2: 'CH',
        iso3: 'CHE',
        numericCode: '756',
        currencyCode: 'CHF',
        currencyName: 'Swiss Franc',
        currencySymbol: 'Fr',
        continent: 'Europe',
        capital: 'Bern',
        languages: ['German', 'French', 'Italian'],
      },
    ],
    [
      'AT',
      {
        name: 'Austria',
        iso2: 'AT',
        iso3: 'AUT',
        numericCode: '040',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Vienna',
        languages: ['German'],
      },
    ],

    // Northern Europe
    [
      'DK',
      {
        name: 'Denmark',
        iso2: 'DK',
        iso3: 'DNK',
        numericCode: '208',
        currencyCode: 'DKK',
        currencyName: 'Danish Krone',
        currencySymbol: 'kr',
        continent: 'Europe',
        capital: 'Copenhagen',
        languages: ['Danish'],
      },
    ],
    [
      'SE',
      {
        name: 'Sweden',
        iso2: 'SE',
        iso3: 'SWE',
        numericCode: '752',
        currencyCode: 'SEK',
        currencyName: 'Swedish Krona',
        currencySymbol: 'kr',
        continent: 'Europe',
        capital: 'Stockholm',
        languages: ['Swedish'],
      },
    ],
    [
      'NO',
      {
        name: 'Norway',
        iso2: 'NO',
        iso3: 'NOR',
        numericCode: '578',
        currencyCode: 'NOK',
        currencyName: 'Norwegian Krone',
        currencySymbol: 'kr',
        continent: 'Europe',
        capital: 'Oslo',
        languages: ['Norwegian'],
      },
    ],
    [
      'FI',
      {
        name: 'Finland',
        iso2: 'FI',
        iso3: 'FIN',
        numericCode: '246',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Helsinki',
        languages: ['Finnish', 'Swedish'],
      },
    ],
    [
      'IS',
      {
        name: 'Iceland',
        iso2: 'IS',
        iso3: 'ISL',
        numericCode: '352',
        currencyCode: 'ISK',
        currencyName: 'Icelandic Króna',
        currencySymbol: 'kr',
        continent: 'Europe',
        capital: 'Reykjavik',
        languages: ['Icelandic'],
      },
    ],

    // Eastern Europe
    [
      'PL',
      {
        name: 'Poland',
        iso2: 'PL',
        iso3: 'POL',
        numericCode: '616',
        currencyCode: 'PLN',
        currencyName: 'Polish Złoty',
        currencySymbol: 'zł',
        continent: 'Europe',
        capital: 'Warsaw',
        languages: ['Polish'],
      },
    ],
    [
      'CZ',
      {
        name: 'Czech Republic',
        iso2: 'CZ',
        iso3: 'CZE',
        numericCode: '203',
        currencyCode: 'CZK',
        currencyName: 'Czech Koruna',
        currencySymbol: 'Kč',
        continent: 'Europe',
        capital: 'Prague',
        languages: ['Czech'],
      },
    ],
    [
      'SK',
      {
        name: 'Slovakia',
        iso2: 'SK',
        iso3: 'SVK',
        numericCode: '703',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Bratislava',
        languages: ['Slovak'],
      },
    ],
    [
      'HU',
      {
        name: 'Hungary',
        iso2: 'HU',
        iso3: 'HUN',
        numericCode: '348',
        currencyCode: 'HUF',
        currencyName: 'Hungarian Forint',
        currencySymbol: 'Ft',
        continent: 'Europe',
        capital: 'Budapest',
        languages: ['Hungarian'],
      },
    ],
    [
      'RO',
      {
        name: 'Romania',
        iso2: 'RO',
        iso3: 'ROU',
        numericCode: '642',
        currencyCode: 'RON',
        currencyName: 'Romanian Leu',
        currencySymbol: 'lei',
        continent: 'Europe',
        capital: 'Bucharest',
        languages: ['Romanian'],
      },
    ],
    [
      'BG',
      {
        name: 'Bulgaria',
        iso2: 'BG',
        iso3: 'BGR',
        numericCode: '100',
        currencyCode: 'BGN',
        currencyName: 'Bulgarian Lev',
        currencySymbol: 'лв',
        continent: 'Europe',
        capital: 'Sofia',
        languages: ['Bulgarian'],
      },
    ],
    [
      'UA',
      {
        name: 'Ukraine',
        iso2: 'UA',
        iso3: 'UKR',
        numericCode: '804',
        currencyCode: 'UAH',
        currencyName: 'Ukrainian Hryvnia',
        currencySymbol: '₴',
        continent: 'Europe',
        capital: 'Kyiv',
        languages: ['Ukrainian'],
      },
    ],
    [
      'RU',
      {
        name: 'Russia',
        iso2: 'RU',
        iso3: 'RUS',
        numericCode: '643',
        currencyCode: 'RUB',
        currencyName: 'Russian Ruble',
        currencySymbol: '₽',
        continent: 'Europe/Asia',
        capital: 'Moscow',
        languages: ['Russian'],
      },
    ],

    // Southern Europe
    [
      'GR',
      {
        name: 'Greece',
        iso2: 'GR',
        iso3: 'GRC',
        numericCode: '300',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Athens',
        languages: ['Greek'],
      },
    ],
    [
      'HR',
      {
        name: 'Croatia',
        iso2: 'HR',
        iso3: 'HRV',
        numericCode: '191',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Zagreb',
        languages: ['Croatian'],
      },
    ],
    [
      'SI',
      {
        name: 'Slovenia',
        iso2: 'SI',
        iso3: 'SVN',
        numericCode: '705',
        currencyCode: 'EUR',
        currencyName: 'Euro',
        currencySymbol: '€',
        continent: 'Europe',
        capital: 'Ljubljana',
        languages: ['Slovenian'],
      },
    ],
    [
      'RS',
      {
        name: 'Serbia',
        iso2: 'RS',
        iso3: 'SRB',
        numericCode: '688',
        currencyCode: 'RSD',
        currencyName: 'Serbian Dinar',
        currencySymbol: 'дин',
        continent: 'Europe',
        capital: 'Belgrade',
        languages: ['Serbian'],
      },
    ],

    // Asia - East
    [
      'CN',
      {
        name: 'China',
        iso2: 'CN',
        iso3: 'CHN',
        numericCode: '156',
        currencyCode: 'CNY',
        currencyName: 'Chinese Yuan',
        currencySymbol: '¥',
        continent: 'Asia',
        capital: 'Beijing',
        languages: ['Chinese'],
      },
    ],
    [
      'JP',
      {
        name: 'Japan',
        iso2: 'JP',
        iso3: 'JPN',
        numericCode: '392',
        currencyCode: 'JPY',
        currencyName: 'Japanese Yen',
        currencySymbol: '¥',
        continent: 'Asia',
        capital: 'Tokyo',
        languages: ['Japanese'],
      },
    ],
    [
      'KR',
      {
        name: 'South Korea',
        iso2: 'KR',
        iso3: 'KOR',
        numericCode: '410',
        currencyCode: 'KRW',
        currencyName: 'South Korean Won',
        currencySymbol: '₩',
        continent: 'Asia',
        capital: 'Seoul',
        languages: ['Korean'],
      },
    ],
    [
      'TW',
      {
        name: 'Taiwan',
        iso2: 'TW',
        iso3: 'TWN',
        numericCode: '158',
        currencyCode: 'TWD',
        currencyName: 'New Taiwan Dollar',
        currencySymbol: '$',
        continent: 'Asia',
        capital: 'Taipei',
        languages: ['Chinese'],
      },
    ],
    [
      'HK',
      {
        name: 'Hong Kong',
        iso2: 'HK',
        iso3: 'HKG',
        numericCode: '344',
        currencyCode: 'HKD',
        currencyName: 'Hong Kong Dollar',
        currencySymbol: '$',
        continent: 'Asia',
        capital: 'Hong Kong',
        languages: ['Chinese', 'English'],
      },
    ],
    [
      'MO',
      {
        name: 'Macau',
        iso2: 'MO',
        iso3: 'MAC',
        numericCode: '446',
        currencyCode: 'MOP',
        currencyName: 'Macanese Pataca',
        currencySymbol: 'P',
        continent: 'Asia',
        capital: 'Macau',
        languages: ['Chinese', 'Portuguese'],
      },
    ],

    // Asia - Southeast
    [
      'SG',
      {
        name: 'Singapore',
        iso2: 'SG',
        iso3: 'SGP',
        numericCode: '702',
        currencyCode: 'SGD',
        currencyName: 'Singapore Dollar',
        currencySymbol: '$',
        continent: 'Asia',
        capital: 'Singapore',
        languages: ['English', 'Malay', 'Chinese', 'Tamil'],
      },
    ],
    [
      'MY',
      {
        name: 'Malaysia',
        iso2: 'MY',
        iso3: 'MYS',
        numericCode: '458',
        currencyCode: 'MYR',
        currencyName: 'Malaysian Ringgit',
        currencySymbol: 'RM',
        continent: 'Asia',
        capital: 'Kuala Lumpur',
        languages: ['Malay'],
      },
    ],
    [
      'TH',
      {
        name: 'Thailand',
        iso2: 'TH',
        iso3: 'THA',
        numericCode: '764',
        currencyCode: 'THB',
        currencyName: 'Thai Baht',
        currencySymbol: '฿',
        continent: 'Asia',
        capital: 'Bangkok',
        languages: ['Thai'],
      },
    ],
    [
      'VN',
      {
        name: 'Vietnam',
        iso2: 'VN',
        iso3: 'VNM',
        numericCode: '704',
        currencyCode: 'VND',
        currencyName: 'Vietnamese Dong',
        currencySymbol: '₫',
        continent: 'Asia',
        capital: 'Hanoi',
        languages: ['Vietnamese'],
      },
    ],
    [
      'PH',
      {
        name: 'Philippines',
        iso2: 'PH',
        iso3: 'PHL',
        numericCode: '608',
        currencyCode: 'PHP',
        currencyName: 'Philippine Peso',
        currencySymbol: '₱',
        continent: 'Asia',
        capital: 'Manila',
        languages: ['Filipino', 'English'],
      },
    ],
    [
      'ID',
      {
        name: 'Indonesia',
        iso2: 'ID',
        iso3: 'IDN',
        numericCode: '360',
        currencyCode: 'IDR',
        currencyName: 'Indonesian Rupiah',
        currencySymbol: 'Rp',
        continent: 'Asia',
        capital: 'Jakarta',
        languages: ['Indonesian'],
      },
    ],

    // Asia - South
    [
      'IN',
      {
        name: 'India',
        iso2: 'IN',
        iso3: 'IND',
        numericCode: '356',
        currencyCode: 'INR',
        currencyName: 'Indian Rupee',
        currencySymbol: '₹',
        continent: 'Asia',
        capital: 'New Delhi',
        languages: ['Hindi', 'English'],
      },
    ],
    [
      'PK',
      {
        name: 'Pakistan',
        iso2: 'PK',
        iso3: 'PAK',
        numericCode: '586',
        currencyCode: 'PKR',
        currencyName: 'Pakistani Rupee',
        currencySymbol: '₨',
        continent: 'Asia',
        capital: 'Islamabad',
        languages: ['Urdu', 'English'],
      },
    ],
    [
      'BD',
      {
        name: 'Bangladesh',
        iso2: 'BD',
        iso3: 'BGD',
        numericCode: '050',
        currencyCode: 'BDT',
        currencyName: 'Bangladeshi Taka',
        currencySymbol: '৳',
        continent: 'Asia',
        capital: 'Dhaka',
        languages: ['Bengali'],
      },
    ],
    [
      'LK',
      {
        name: 'Sri Lanka',
        iso2: 'LK',
        iso3: 'LKA',
        numericCode: '144',
        currencyCode: 'LKR',
        currencyName: 'Sri Lankan Rupee',
        currencySymbol: 'Rs',
        continent: 'Asia',
        capital: 'Colombo',
        languages: ['Sinhala', 'Tamil'],
      },
    ],

    // Middle East
    [
      'SA',
      {
        name: 'Saudi Arabia',
        iso2: 'SA',
        iso3: 'SAU',
        numericCode: '682',
        currencyCode: 'SAR',
        currencyName: 'Saudi Riyal',
        currencySymbol: 'ر.س',
        continent: 'Asia',
        capital: 'Riyadh',
        languages: ['Arabic'],
      },
    ],
    [
      'AE',
      {
        name: 'United Arab Emirates',
        iso2: 'AE',
        iso3: 'ARE',
        numericCode: '784',
        currencyCode: 'AED',
        currencyName: 'UAE Dirham',
        currencySymbol: 'د.إ',
        continent: 'Asia',
        capital: 'Abu Dhabi',
        languages: ['Arabic'],
      },
    ],
    [
      'IL',
      {
        name: 'Israel',
        iso2: 'IL',
        iso3: 'ISR',
        numericCode: '376',
        currencyCode: 'ILS',
        currencyName: 'Israeli Shekel',
        currencySymbol: '₪',
        continent: 'Asia',
        capital: 'Jerusalem',
        languages: ['Hebrew', 'Arabic'],
      },
    ],
    [
      'TR',
      {
        name: 'Turkey',
        iso2: 'TR',
        iso3: 'TUR',
        numericCode: '792',
        currencyCode: 'TRY',
        currencyName: 'Turkish Lira',
        currencySymbol: '₺',
        continent: 'Asia/Europe',
        capital: 'Ankara',
        languages: ['Turkish'],
      },
    ],

    // Africa
    [
      'ZA',
      {
        name: 'South Africa',
        iso2: 'ZA',
        iso3: 'ZAF',
        numericCode: '710',
        currencyCode: 'ZAR',
        currencyName: 'South African Rand',
        currencySymbol: 'R',
        continent: 'Africa',
        capital: 'Pretoria',
        languages: ['Afrikaans', 'English', 'Zulu'],
      },
    ],
    [
      'EG',
      {
        name: 'Egypt',
        iso2: 'EG',
        iso3: 'EGY',
        numericCode: '818',
        currencyCode: 'EGP',
        currencyName: 'Egyptian Pound',
        currencySymbol: '£',
        continent: 'Africa',
        capital: 'Cairo',
        languages: ['Arabic'],
      },
    ],
    [
      'NG',
      {
        name: 'Nigeria',
        iso2: 'NG',
        iso3: 'NGA',
        numericCode: '566',
        currencyCode: 'NGN',
        currencyName: 'Nigerian Naira',
        currencySymbol: '₦',
        continent: 'Africa',
        capital: 'Abuja',
        languages: ['English'],
      },
    ],
    [
      'KE',
      {
        name: 'Kenya',
        iso2: 'KE',
        iso3: 'KEN',
        numericCode: '404',
        currencyCode: 'KES',
        currencyName: 'Kenyan Shilling',
        currencySymbol: 'Sh',
        continent: 'Africa',
        capital: 'Nairobi',
        languages: ['English', 'Swahili'],
      },
    ],
    [
      'MA',
      {
        name: 'Morocco',
        iso2: 'MA',
        iso3: 'MAR',
        numericCode: '504',
        currencyCode: 'MAD',
        currencyName: 'Moroccan Dirham',
        currencySymbol: 'د.م.',
        continent: 'Africa',
        capital: 'Rabat',
        languages: ['Arabic', 'Berber'],
      },
    ],

    // Oceania
    [
      'AU',
      {
        name: 'Australia',
        iso2: 'AU',
        iso3: 'AUS',
        numericCode: '036',
        currencyCode: 'AUD',
        currencyName: 'Australian Dollar',
        currencySymbol: '$',
        continent: 'Oceania',
        capital: 'Canberra',
        languages: ['English'],
      },
    ],
    [
      'NZ',
      {
        name: 'New Zealand',
        iso2: 'NZ',
        iso3: 'NZL',
        numericCode: '554',
        currencyCode: 'NZD',
        currencyName: 'New Zealand Dollar',
        currencySymbol: '$',
        continent: 'Oceania',
        capital: 'Wellington',
        languages: ['English', 'Maori'],
      },
    ],
  ]);

  // Index by ISO3 for quick lookups
  private static readonly BY_ISO3 = new Map<string, CountryInfo>(
    Array.from(CountryRegistry.COUNTRIES.values()).map((country) => [country.iso3, country])
  );

  // Index by currency code for reverse lookups
  private static readonly BY_CURRENCY = new Map<string, CountryInfo[]>();

  static {
    // Build currency index
    for (const country of CountryRegistry.COUNTRIES.values()) {
      const existing = CountryRegistry.BY_CURRENCY.get(country.currencyCode) || [];
      existing.push(country);
      CountryRegistry.BY_CURRENCY.set(country.currencyCode, existing);
    }
  }

  /**
   * Gets country information by ISO2 code.
   *
   * @param iso2 - The 2-letter country code (e.g., "US", "MX")
   * @returns Country info or undefined if not found
   *
   * @example
   * ```typescript
   * const country = CountryRegistry.getByISO2('MX');
   * console.log(country?.name); // "Mexico"
   * console.log(country?.currencyCode); // "MXN"
   * ```
   */
  static getByISO2(iso2: string): CountryInfo | undefined {
    return this.COUNTRIES.get(iso2.toUpperCase());
  }

  /**
   * Gets country information by ISO3 code.
   *
   * @param iso3 - The 3-letter country code (e.g., "USA", "MEX")
   * @returns Country info or undefined if not found
   *
   * @example
   * ```typescript
   * const country = CountryRegistry.getByISO3('MEX');
   * console.log(country?.name); // "Mexico"
   * ```
   */
  static getByISO3(iso3: string): CountryInfo | undefined {
    return this.BY_ISO3.get(iso3.toUpperCase());
  }

  /**
   * Gets all countries that use a specific currency.
   *
   * @param currencyCode - The ISO 4217 currency code (e.g., "USD", "EUR")
   * @returns Array of countries using this currency
   *
   * @example
   * ```typescript
   * const eurCountries = CountryRegistry.getByCurrency('EUR');
   * console.log(eurCountries.length); // 19+ countries
   * ```
   */
  static getByCurrency(currencyCode: string): CountryInfo[] {
    return this.BY_CURRENCY.get(currencyCode.toUpperCase()) || [];
  }

  /**
   * Gets all registered countries.
   *
   * @returns Array of all country information
   */
  static getAllCountries(): CountryInfo[] {
    return Array.from(this.COUNTRIES.values());
  }

  /**
   * Gets all countries in a specific continent.
   *
   * @param continent - The continent name
   * @returns Array of countries in the continent
   *
   * @example
   * ```typescript
   * const latinAmerica = CountryRegistry.getByContinent('South America');
   * ```
   */
  static getByContinent(continent: string): CountryInfo[] {
    return Array.from(this.COUNTRIES.values()).filter((country) =>
      country.continent.toLowerCase().includes(continent.toLowerCase())
    );
  }

  /**
   * Checks if a country code exists in the registry.
   *
   * @param iso2 - The 2-letter country code
   * @returns true if the country exists
   */
  static hasCountry(iso2: string): boolean {
    return this.COUNTRIES.has(iso2.toUpperCase());
  }

  /**
   * Gets all unique currency codes used across all countries.
   *
   * @returns Array of unique currency codes
   */
  static getAllCurrencyCodes(): string[] {
    return Array.from(this.BY_CURRENCY.keys());
  }
}
