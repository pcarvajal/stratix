/**
 * Country calling code information.
 */
export interface CountryCallingCodeInfo {
  code: string;
  country: string;
  iso2: string;
  iso3: string;
  maxLength: number;
  minLength: number;
}

/**
 * Registry of country calling codes following ITU-T E.164 standard.
 *
 * This module provides a comprehensive mapping of international dialing codes
 * to their respective countries and validation rules.
 */
export class CountryCallingCodeRegistry {
  private static readonly CODES: ReadonlyMap<string, CountryCallingCodeInfo> = new Map([
    // North America
    [
      '+1',
      {
        code: '+1',
        country: 'United States / Canada',
        iso2: 'US',
        iso3: 'USA',
        maxLength: 10,
        minLength: 10,
      },
    ],

    // Central & South America
    [
      '+52',
      { code: '+52', country: 'Mexico', iso2: 'MX', iso3: 'MEX', maxLength: 10, minLength: 10 },
    ],
    ['+53', { code: '+53', country: 'Cuba', iso2: 'CU', iso3: 'CUB', maxLength: 8, minLength: 8 }],
    [
      '+54',
      { code: '+54', country: 'Argentina', iso2: 'AR', iso3: 'ARG', maxLength: 11, minLength: 10 },
    ],
    [
      '+55',
      { code: '+55', country: 'Brazil', iso2: 'BR', iso3: 'BRA', maxLength: 11, minLength: 10 },
    ],
    ['+56', { code: '+56', country: 'Chile', iso2: 'CL', iso3: 'CHL', maxLength: 9, minLength: 9 }],
    [
      '+57',
      { code: '+57', country: 'Colombia', iso2: 'CO', iso3: 'COL', maxLength: 10, minLength: 10 },
    ],
    [
      '+58',
      { code: '+58', country: 'Venezuela', iso2: 'VE', iso3: 'VEN', maxLength: 10, minLength: 10 },
    ],
    ['+51', { code: '+51', country: 'Peru', iso2: 'PE', iso3: 'PER', maxLength: 9, minLength: 9 }],
    [
      '+503',
      { code: '+503', country: 'El Salvador', iso2: 'SV', iso3: 'SLV', maxLength: 8, minLength: 8 },
    ],
    [
      '+504',
      { code: '+504', country: 'Honduras', iso2: 'HN', iso3: 'HND', maxLength: 8, minLength: 8 },
    ],
    [
      '+505',
      { code: '+505', country: 'Nicaragua', iso2: 'NI', iso3: 'NIC', maxLength: 8, minLength: 8 },
    ],
    [
      '+506',
      { code: '+506', country: 'Costa Rica', iso2: 'CR', iso3: 'CRI', maxLength: 8, minLength: 8 },
    ],
    [
      '+507',
      { code: '+507', country: 'Panama', iso2: 'PA', iso3: 'PAN', maxLength: 8, minLength: 8 },
    ],
    [
      '+591',
      { code: '+591', country: 'Bolivia', iso2: 'BO', iso3: 'BOL', maxLength: 8, minLength: 8 },
    ],
    [
      '+592',
      { code: '+592', country: 'Guyana', iso2: 'GY', iso3: 'GUY', maxLength: 7, minLength: 7 },
    ],
    [
      '+593',
      { code: '+593', country: 'Ecuador', iso2: 'EC', iso3: 'ECU', maxLength: 9, minLength: 9 },
    ],
    [
      '+594',
      {
        code: '+594',
        country: 'French Guiana',
        iso2: 'GF',
        iso3: 'GUF',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+595',
      { code: '+595', country: 'Paraguay', iso2: 'PY', iso3: 'PRY', maxLength: 9, minLength: 9 },
    ],
    [
      '+597',
      { code: '+597', country: 'Suriname', iso2: 'SR', iso3: 'SUR', maxLength: 7, minLength: 6 },
    ],
    [
      '+598',
      { code: '+598', country: 'Uruguay', iso2: 'UY', iso3: 'URY', maxLength: 8, minLength: 8 },
    ],

    // Europe
    [
      '+33',
      { code: '+33', country: 'France', iso2: 'FR', iso3: 'FRA', maxLength: 9, minLength: 9 },
    ],
    ['+34', { code: '+34', country: 'Spain', iso2: 'ES', iso3: 'ESP', maxLength: 9, minLength: 9 }],
    [
      '+39',
      { code: '+39', country: 'Italy', iso2: 'IT', iso3: 'ITA', maxLength: 10, minLength: 9 },
    ],
    [
      '+41',
      { code: '+41', country: 'Switzerland', iso2: 'CH', iso3: 'CHE', maxLength: 9, minLength: 9 },
    ],
    [
      '+43',
      { code: '+43', country: 'Austria', iso2: 'AT', iso3: 'AUT', maxLength: 11, minLength: 10 },
    ],
    [
      '+44',
      {
        code: '+44',
        country: 'United Kingdom',
        iso2: 'GB',
        iso3: 'GBR',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+45',
      { code: '+45', country: 'Denmark', iso2: 'DK', iso3: 'DNK', maxLength: 8, minLength: 8 },
    ],
    [
      '+46',
      { code: '+46', country: 'Sweden', iso2: 'SE', iso3: 'SWE', maxLength: 9, minLength: 9 },
    ],
    [
      '+47',
      { code: '+47', country: 'Norway', iso2: 'NO', iso3: 'NOR', maxLength: 8, minLength: 8 },
    ],
    [
      '+48',
      { code: '+48', country: 'Poland', iso2: 'PL', iso3: 'POL', maxLength: 9, minLength: 9 },
    ],
    [
      '+49',
      { code: '+49', country: 'Germany', iso2: 'DE', iso3: 'DEU', maxLength: 11, minLength: 10 },
    ],
    [
      '+351',
      { code: '+351', country: 'Portugal', iso2: 'PT', iso3: 'PRT', maxLength: 9, minLength: 9 },
    ],
    [
      '+352',
      { code: '+352', country: 'Luxembourg', iso2: 'LU', iso3: 'LUX', maxLength: 9, minLength: 9 },
    ],
    [
      '+353',
      { code: '+353', country: 'Ireland', iso2: 'IE', iso3: 'IRL', maxLength: 9, minLength: 9 },
    ],
    [
      '+354',
      { code: '+354', country: 'Iceland', iso2: 'IS', iso3: 'ISL', maxLength: 7, minLength: 7 },
    ],
    [
      '+355',
      { code: '+355', country: 'Albania', iso2: 'AL', iso3: 'ALB', maxLength: 9, minLength: 9 },
    ],
    [
      '+356',
      { code: '+356', country: 'Malta', iso2: 'MT', iso3: 'MLT', maxLength: 8, minLength: 8 },
    ],
    [
      '+357',
      { code: '+357', country: 'Cyprus', iso2: 'CY', iso3: 'CYP', maxLength: 8, minLength: 8 },
    ],
    [
      '+358',
      { code: '+358', country: 'Finland', iso2: 'FI', iso3: 'FIN', maxLength: 10, minLength: 9 },
    ],
    [
      '+359',
      { code: '+359', country: 'Bulgaria', iso2: 'BG', iso3: 'BGR', maxLength: 9, minLength: 9 },
    ],
    [
      '+36',
      { code: '+36', country: 'Hungary', iso2: 'HU', iso3: 'HUN', maxLength: 9, minLength: 9 },
    ],
    [
      '+370',
      { code: '+370', country: 'Lithuania', iso2: 'LT', iso3: 'LTU', maxLength: 8, minLength: 8 },
    ],
    [
      '+371',
      { code: '+371', country: 'Latvia', iso2: 'LV', iso3: 'LVA', maxLength: 8, minLength: 8 },
    ],
    [
      '+372',
      { code: '+372', country: 'Estonia', iso2: 'EE', iso3: 'EST', maxLength: 8, minLength: 7 },
    ],
    [
      '+373',
      { code: '+373', country: 'Moldova', iso2: 'MD', iso3: 'MDA', maxLength: 8, minLength: 8 },
    ],
    [
      '+374',
      { code: '+374', country: 'Armenia', iso2: 'AM', iso3: 'ARM', maxLength: 8, minLength: 8 },
    ],
    [
      '+375',
      { code: '+375', country: 'Belarus', iso2: 'BY', iso3: 'BLR', maxLength: 9, minLength: 9 },
    ],
    [
      '+376',
      { code: '+376', country: 'Andorra', iso2: 'AD', iso3: 'AND', maxLength: 6, minLength: 6 },
    ],
    [
      '+377',
      { code: '+377', country: 'Monaco', iso2: 'MC', iso3: 'MCO', maxLength: 8, minLength: 8 },
    ],
    [
      '+378',
      {
        code: '+378',
        country: 'San Marino',
        iso2: 'SM',
        iso3: 'SMR',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+380',
      { code: '+380', country: 'Ukraine', iso2: 'UA', iso3: 'UKR', maxLength: 9, minLength: 9 },
    ],
    [
      '+381',
      { code: '+381', country: 'Serbia', iso2: 'RS', iso3: 'SRB', maxLength: 9, minLength: 8 },
    ],
    [
      '+382',
      { code: '+382', country: 'Montenegro', iso2: 'ME', iso3: 'MNE', maxLength: 8, minLength: 8 },
    ],
    [
      '+383',
      { code: '+383', country: 'Kosovo', iso2: 'XK', iso3: 'XKX', maxLength: 8, minLength: 8 },
    ],
    [
      '+385',
      { code: '+385', country: 'Croatia', iso2: 'HR', iso3: 'HRV', maxLength: 9, minLength: 8 },
    ],
    [
      '+386',
      { code: '+386', country: 'Slovenia', iso2: 'SI', iso3: 'SVN', maxLength: 8, minLength: 8 },
    ],
    [
      '+387',
      {
        code: '+387',
        country: 'Bosnia and Herzegovina',
        iso2: 'BA',
        iso3: 'BIH',
        maxLength: 8,
        minLength: 8,
      },
    ],
    [
      '+389',
      {
        code: '+389',
        country: 'North Macedonia',
        iso2: 'MK',
        iso3: 'MKD',
        maxLength: 8,
        minLength: 8,
      },
    ],
    [
      '+30',
      { code: '+30', country: 'Greece', iso2: 'GR', iso3: 'GRC', maxLength: 10, minLength: 10 },
    ],
    [
      '+31',
      { code: '+31', country: 'Netherlands', iso2: 'NL', iso3: 'NLD', maxLength: 9, minLength: 9 },
    ],
    [
      '+32',
      { code: '+32', country: 'Belgium', iso2: 'BE', iso3: 'BEL', maxLength: 9, minLength: 9 },
    ],
    [
      '+40',
      { code: '+40', country: 'Romania', iso2: 'RO', iso3: 'ROU', maxLength: 9, minLength: 9 },
    ],
    [
      '+420',
      {
        code: '+420',
        country: 'Czech Republic',
        iso2: 'CZ',
        iso3: 'CZE',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+421',
      { code: '+421', country: 'Slovakia', iso2: 'SK', iso3: 'SVK', maxLength: 9, minLength: 9 },
    ],

    // Asia
    [
      '+7',
      {
        code: '+7',
        country: 'Russia / Kazakhstan',
        iso2: 'RU',
        iso3: 'RUS',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+20',
      { code: '+20', country: 'Egypt', iso2: 'EG', iso3: 'EGY', maxLength: 10, minLength: 10 },
    ],
    [
      '+27',
      { code: '+27', country: 'South Africa', iso2: 'ZA', iso3: 'ZAF', maxLength: 9, minLength: 9 },
    ],
    [
      '+81',
      { code: '+81', country: 'Japan', iso2: 'JP', iso3: 'JPN', maxLength: 10, minLength: 10 },
    ],
    [
      '+82',
      { code: '+82', country: 'South Korea', iso2: 'KR', iso3: 'KOR', maxLength: 10, minLength: 9 },
    ],
    [
      '+84',
      { code: '+84', country: 'Vietnam', iso2: 'VN', iso3: 'VNM', maxLength: 10, minLength: 9 },
    ],
    [
      '+86',
      { code: '+86', country: 'China', iso2: 'CN', iso3: 'CHN', maxLength: 11, minLength: 11 },
    ],
    [
      '+90',
      { code: '+90', country: 'Turkey', iso2: 'TR', iso3: 'TUR', maxLength: 10, minLength: 10 },
    ],
    [
      '+91',
      { code: '+91', country: 'India', iso2: 'IN', iso3: 'IND', maxLength: 10, minLength: 10 },
    ],
    [
      '+92',
      { code: '+92', country: 'Pakistan', iso2: 'PK', iso3: 'PAK', maxLength: 10, minLength: 10 },
    ],
    [
      '+93',
      { code: '+93', country: 'Afghanistan', iso2: 'AF', iso3: 'AFG', maxLength: 9, minLength: 9 },
    ],
    [
      '+94',
      { code: '+94', country: 'Sri Lanka', iso2: 'LK', iso3: 'LKA', maxLength: 9, minLength: 9 },
    ],
    [
      '+95',
      { code: '+95', country: 'Myanmar', iso2: 'MM', iso3: 'MMR', maxLength: 9, minLength: 8 },
    ],
    [
      '+98',
      { code: '+98', country: 'Iran', iso2: 'IR', iso3: 'IRN', maxLength: 10, minLength: 10 },
    ],
    [
      '+60',
      { code: '+60', country: 'Malaysia', iso2: 'MY', iso3: 'MYS', maxLength: 10, minLength: 9 },
    ],
    [
      '+61',
      { code: '+61', country: 'Australia', iso2: 'AU', iso3: 'AUS', maxLength: 9, minLength: 9 },
    ],
    [
      '+62',
      { code: '+62', country: 'Indonesia', iso2: 'ID', iso3: 'IDN', maxLength: 11, minLength: 10 },
    ],
    [
      '+63',
      {
        code: '+63',
        country: 'Philippines',
        iso2: 'PH',
        iso3: 'PHL',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+64',
      { code: '+64', country: 'New Zealand', iso2: 'NZ', iso3: 'NZL', maxLength: 9, minLength: 9 },
    ],
    [
      '+65',
      { code: '+65', country: 'Singapore', iso2: 'SG', iso3: 'SGP', maxLength: 8, minLength: 8 },
    ],
    [
      '+66',
      { code: '+66', country: 'Thailand', iso2: 'TH', iso3: 'THA', maxLength: 9, minLength: 9 },
    ],
    [
      '+850',
      {
        code: '+850',
        country: 'North Korea',
        iso2: 'KP',
        iso3: 'PRK',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+852',
      { code: '+852', country: 'Hong Kong', iso2: 'HK', iso3: 'HKG', maxLength: 8, minLength: 8 },
    ],
    [
      '+853',
      { code: '+853', country: 'Macau', iso2: 'MO', iso3: 'MAC', maxLength: 8, minLength: 8 },
    ],
    [
      '+855',
      { code: '+855', country: 'Cambodia', iso2: 'KH', iso3: 'KHM', maxLength: 9, minLength: 8 },
    ],
    [
      '+856',
      { code: '+856', country: 'Laos', iso2: 'LA', iso3: 'LAO', maxLength: 10, minLength: 9 },
    ],
    [
      '+880',
      {
        code: '+880',
        country: 'Bangladesh',
        iso2: 'BD',
        iso3: 'BGD',
        maxLength: 10,
        minLength: 10,
      },
    ],
    [
      '+886',
      { code: '+886', country: 'Taiwan', iso2: 'TW', iso3: 'TWN', maxLength: 9, minLength: 9 },
    ],
    [
      '+960',
      { code: '+960', country: 'Maldives', iso2: 'MV', iso3: 'MDV', maxLength: 7, minLength: 7 },
    ],
    [
      '+961',
      { code: '+961', country: 'Lebanon', iso2: 'LB', iso3: 'LBN', maxLength: 8, minLength: 7 },
    ],
    [
      '+962',
      { code: '+962', country: 'Jordan', iso2: 'JO', iso3: 'JOR', maxLength: 9, minLength: 9 },
    ],
    [
      '+963',
      { code: '+963', country: 'Syria', iso2: 'SY', iso3: 'SYR', maxLength: 9, minLength: 9 },
    ],
    [
      '+964',
      { code: '+964', country: 'Iraq', iso2: 'IQ', iso3: 'IRQ', maxLength: 10, minLength: 10 },
    ],
    [
      '+965',
      { code: '+965', country: 'Kuwait', iso2: 'KW', iso3: 'KWT', maxLength: 8, minLength: 8 },
    ],
    [
      '+966',
      {
        code: '+966',
        country: 'Saudi Arabia',
        iso2: 'SA',
        iso3: 'SAU',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+967',
      { code: '+967', country: 'Yemen', iso2: 'YE', iso3: 'YEM', maxLength: 9, minLength: 9 },
    ],
    [
      '+968',
      { code: '+968', country: 'Oman', iso2: 'OM', iso3: 'OMN', maxLength: 8, minLength: 8 },
    ],
    [
      '+970',
      { code: '+970', country: 'Palestine', iso2: 'PS', iso3: 'PSE', maxLength: 9, minLength: 9 },
    ],
    [
      '+971',
      {
        code: '+971',
        country: 'United Arab Emirates',
        iso2: 'AE',
        iso3: 'ARE',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+972',
      { code: '+972', country: 'Israel', iso2: 'IL', iso3: 'ISR', maxLength: 9, minLength: 9 },
    ],
    [
      '+973',
      { code: '+973', country: 'Bahrain', iso2: 'BH', iso3: 'BHR', maxLength: 8, minLength: 8 },
    ],
    [
      '+974',
      { code: '+974', country: 'Qatar', iso2: 'QA', iso3: 'QAT', maxLength: 8, minLength: 8 },
    ],
    [
      '+975',
      { code: '+975', country: 'Bhutan', iso2: 'BT', iso3: 'BTN', maxLength: 8, minLength: 8 },
    ],
    [
      '+976',
      { code: '+976', country: 'Mongolia', iso2: 'MN', iso3: 'MNG', maxLength: 8, minLength: 8 },
    ],
    [
      '+977',
      { code: '+977', country: 'Nepal', iso2: 'NP', iso3: 'NPL', maxLength: 10, minLength: 10 },
    ],

    // Africa
    [
      '+212',
      { code: '+212', country: 'Morocco', iso2: 'MA', iso3: 'MAR', maxLength: 9, minLength: 9 },
    ],
    [
      '+213',
      { code: '+213', country: 'Algeria', iso2: 'DZ', iso3: 'DZA', maxLength: 9, minLength: 9 },
    ],
    [
      '+216',
      { code: '+216', country: 'Tunisia', iso2: 'TN', iso3: 'TUN', maxLength: 8, minLength: 8 },
    ],
    [
      '+218',
      { code: '+218', country: 'Libya', iso2: 'LY', iso3: 'LBY', maxLength: 9, minLength: 9 },
    ],
    [
      '+220',
      { code: '+220', country: 'Gambia', iso2: 'GM', iso3: 'GMB', maxLength: 7, minLength: 7 },
    ],
    [
      '+221',
      { code: '+221', country: 'Senegal', iso2: 'SN', iso3: 'SEN', maxLength: 9, minLength: 9 },
    ],
    [
      '+222',
      { code: '+222', country: 'Mauritania', iso2: 'MR', iso3: 'MRT', maxLength: 8, minLength: 8 },
    ],
    [
      '+223',
      { code: '+223', country: 'Mali', iso2: 'ML', iso3: 'MLI', maxLength: 8, minLength: 8 },
    ],
    [
      '+224',
      { code: '+224', country: 'Guinea', iso2: 'GN', iso3: 'GIN', maxLength: 9, minLength: 9 },
    ],
    [
      '+225',
      { code: '+225', country: 'Ivory Coast', iso2: 'CI', iso3: 'CIV', maxLength: 8, minLength: 8 },
    ],
    [
      '+226',
      {
        code: '+226',
        country: 'Burkina Faso',
        iso2: 'BF',
        iso3: 'BFA',
        maxLength: 8,
        minLength: 8,
      },
    ],
    [
      '+227',
      { code: '+227', country: 'Niger', iso2: 'NE', iso3: 'NER', maxLength: 8, minLength: 8 },
    ],
    [
      '+228',
      { code: '+228', country: 'Togo', iso2: 'TG', iso3: 'TGO', maxLength: 8, minLength: 8 },
    ],
    [
      '+229',
      { code: '+229', country: 'Benin', iso2: 'BJ', iso3: 'BEN', maxLength: 8, minLength: 8 },
    ],
    [
      '+230',
      { code: '+230', country: 'Mauritius', iso2: 'MU', iso3: 'MUS', maxLength: 8, minLength: 7 },
    ],
    [
      '+231',
      { code: '+231', country: 'Liberia', iso2: 'LR', iso3: 'LBR', maxLength: 8, minLength: 7 },
    ],
    [
      '+232',
      {
        code: '+232',
        country: 'Sierra Leone',
        iso2: 'SL',
        iso3: 'SLE',
        maxLength: 8,
        minLength: 8,
      },
    ],
    [
      '+233',
      { code: '+233', country: 'Ghana', iso2: 'GH', iso3: 'GHA', maxLength: 9, minLength: 9 },
    ],
    [
      '+234',
      { code: '+234', country: 'Nigeria', iso2: 'NG', iso3: 'NGA', maxLength: 10, minLength: 10 },
    ],
    [
      '+235',
      { code: '+235', country: 'Chad', iso2: 'TD', iso3: 'TCD', maxLength: 8, minLength: 8 },
    ],
    [
      '+236',
      {
        code: '+236',
        country: 'Central African Republic',
        iso2: 'CF',
        iso3: 'CAF',
        maxLength: 8,
        minLength: 8,
      },
    ],
    [
      '+237',
      { code: '+237', country: 'Cameroon', iso2: 'CM', iso3: 'CMR', maxLength: 9, minLength: 9 },
    ],
    [
      '+238',
      { code: '+238', country: 'Cape Verde', iso2: 'CV', iso3: 'CPV', maxLength: 7, minLength: 7 },
    ],
    [
      '+239',
      {
        code: '+239',
        country: 'São Tomé and Príncipe',
        iso2: 'ST',
        iso3: 'STP',
        maxLength: 7,
        minLength: 7,
      },
    ],
    [
      '+240',
      {
        code: '+240',
        country: 'Equatorial Guinea',
        iso2: 'GQ',
        iso3: 'GNQ',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+241',
      { code: '+241', country: 'Gabon', iso2: 'GA', iso3: 'GAB', maxLength: 7, minLength: 7 },
    ],
    [
      '+242',
      {
        code: '+242',
        country: 'Republic of the Congo',
        iso2: 'CG',
        iso3: 'COG',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+243',
      {
        code: '+243',
        country: 'Democratic Republic of the Congo',
        iso2: 'CD',
        iso3: 'COD',
        maxLength: 9,
        minLength: 9,
      },
    ],
    [
      '+244',
      { code: '+244', country: 'Angola', iso2: 'AO', iso3: 'AGO', maxLength: 9, minLength: 9 },
    ],
    [
      '+245',
      {
        code: '+245',
        country: 'Guinea-Bissau',
        iso2: 'GW',
        iso3: 'GNB',
        maxLength: 7,
        minLength: 7,
      },
    ],
    [
      '+248',
      { code: '+248', country: 'Seychelles', iso2: 'SC', iso3: 'SYC', maxLength: 7, minLength: 7 },
    ],
    [
      '+249',
      { code: '+249', country: 'Sudan', iso2: 'SD', iso3: 'SDN', maxLength: 9, minLength: 9 },
    ],
    [
      '+250',
      { code: '+250', country: 'Rwanda', iso2: 'RW', iso3: 'RWA', maxLength: 9, minLength: 9 },
    ],
    [
      '+251',
      { code: '+251', country: 'Ethiopia', iso2: 'ET', iso3: 'ETH', maxLength: 9, minLength: 9 },
    ],
    [
      '+252',
      { code: '+252', country: 'Somalia', iso2: 'SO', iso3: 'SOM', maxLength: 8, minLength: 8 },
    ],
    [
      '+253',
      { code: '+253', country: 'Djibouti', iso2: 'DJ', iso3: 'DJI', maxLength: 8, minLength: 8 },
    ],
    [
      '+254',
      { code: '+254', country: 'Kenya', iso2: 'KE', iso3: 'KEN', maxLength: 9, minLength: 9 },
    ],
    [
      '+255',
      { code: '+255', country: 'Tanzania', iso2: 'TZ', iso3: 'TZA', maxLength: 9, minLength: 9 },
    ],
    [
      '+256',
      { code: '+256', country: 'Uganda', iso2: 'UG', iso3: 'UGA', maxLength: 9, minLength: 9 },
    ],
    [
      '+257',
      { code: '+257', country: 'Burundi', iso2: 'BI', iso3: 'BDI', maxLength: 8, minLength: 8 },
    ],
    [
      '+258',
      { code: '+258', country: 'Mozambique', iso2: 'MZ', iso3: 'MOZ', maxLength: 9, minLength: 9 },
    ],
    [
      '+260',
      { code: '+260', country: 'Zambia', iso2: 'ZM', iso3: 'ZMB', maxLength: 9, minLength: 9 },
    ],
    [
      '+261',
      { code: '+261', country: 'Madagascar', iso2: 'MG', iso3: 'MDG', maxLength: 9, minLength: 9 },
    ],
    [
      '+262',
      { code: '+262', country: 'Réunion', iso2: 'RE', iso3: 'REU', maxLength: 9, minLength: 9 },
    ],
    [
      '+263',
      { code: '+263', country: 'Zimbabwe', iso2: 'ZW', iso3: 'ZWE', maxLength: 9, minLength: 9 },
    ],
    [
      '+264',
      { code: '+264', country: 'Namibia', iso2: 'NA', iso3: 'NAM', maxLength: 9, minLength: 9 },
    ],
    [
      '+265',
      { code: '+265', country: 'Malawi', iso2: 'MW', iso3: 'MWI', maxLength: 9, minLength: 9 },
    ],
    [
      '+266',
      { code: '+266', country: 'Lesotho', iso2: 'LS', iso3: 'LSO', maxLength: 8, minLength: 8 },
    ],
    [
      '+267',
      { code: '+267', country: 'Botswana', iso2: 'BW', iso3: 'BWA', maxLength: 8, minLength: 8 },
    ],
    [
      '+268',
      { code: '+268', country: 'Eswatini', iso2: 'SZ', iso3: 'SWZ', maxLength: 8, minLength: 8 },
    ],
    [
      '+269',
      { code: '+269', country: 'Comoros', iso2: 'KM', iso3: 'COM', maxLength: 7, minLength: 7 },
    ],
  ]);

  /**
   * Gets the country calling code information from a phone number.
   * Tries to match from longest to shortest code to handle overlapping prefixes.
   *
   * @param phoneNumber - The phone number starting with +
   * @returns The country code info or undefined if not found
   *
   * @example
   * ```typescript
   * const info = CountryCallingCodeRegistry.findCode('+1234567890');
   * console.log(info?.country); // "United States / Canada"
   * ```
   */
  static findCode(phoneNumber: string): CountryCallingCodeInfo | undefined {
    // Sort potential codes by length (longest first) to match more specific codes first
    const possibleCodes = Array.from(this.CODES.keys())
      .filter((code) => phoneNumber.startsWith(code))
      .sort((a, b) => b.length - a.length);

    if (possibleCodes.length === 0) {
      return undefined;
    }

    return this.CODES.get(possibleCodes[0]);
  }

  /**
   * Gets country code info by the code itself.
   *
   * @param code - The country code (e.g., "+1", "+52")
   * @returns The country code info or undefined if not found
   *
   * @example
   * ```typescript
   * const info = CountryCallingCodeRegistry.getByCode('+52');
   * console.log(info?.country); // "Mexico"
   * ```
   */
  static getByCode(code: string): CountryCallingCodeInfo | undefined {
    return this.CODES.get(code);
  }

  /**
   * Gets all registered country codes.
   *
   * @returns Array of all country code information
   */
  static getAllCodes(): CountryCallingCodeInfo[] {
    return Array.from(this.CODES.values());
  }

  /**
   * Checks if a country code exists in the registry.
   *
   * @param code - The country code to check
   * @returns true if the code exists
   */
  static hasCode(code: string): boolean {
    return this.CODES.has(code);
  }
}
