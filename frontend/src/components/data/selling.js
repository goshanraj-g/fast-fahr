// Simple data structure for Make -> Models mapping
const carModelsByMake = {
    Audi: [
        'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
        'e-tron', 'e-tron GT',
        'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron',
        'R8',
        'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3', 'RS Q8', 'RS e-tron GT',
        'S1', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8',
        'SQ2', 'SQ5', 'SQ7', 'SQ8',
        'TT', 'TTS', 'TT RS'
    ],
    BMW: [
        '1 Series', '2 Series', '2 Series Active Tourer', '2 Series Gran Coupe',
        '3 Series', '4 Series', '5 Series', '6 Series', '6 Series Gran Turismo',
        '7 Series', '8 Series',
        'i3', 'i4', 'i5', 'i7', 'i8',
        'iX', 'iX1', 'iX2', 'iX3',
        'M2', 'M3', 'M4', 'M5', 'M6', 'M8',
        'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7',
        'XM',
        'Z4'
    ],
    'Mercedes-Benz': [
        'A-Class', 'AMG GT', 'AMG ONE', 'AMG SL',
        'B-Class',
        'C-Class', 'Citan',
        'CLE',
        'CLA', 'CLS',
        'E-Class',
        'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV',
        'G-Class', 'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS',
        'Maybach GLS', 'Maybach S-Class',
        'S-Class', 'SLC', 'SLK',
        'Sprinter',
        'V-Class',
        'X-Class' 
    ],
    Porsche: [
        '718 Boxster', '718 Cayman', '718 Spyder',
        '911',
        '911 GT2 RS', '911 GT3', '911 GT3 RS', '911 S/T', '911 Sport Classic', '911 Turbo', '911 Turbo S',
        '918 Spyder',
        'Carrera GT',
        'Cayenne',
        'Macan',
        'Panamera', 'Panamera Sport Turismo',
        'Taycan', 'Taycan Cross Turismo', 'Taycan Sport Turismo'
    ],
    Volkswagen: [
        'Amarok',
        'Arteon', 'Arteon Shooting Brake',
        'Atlas', 'Atlas Cross Sport',
        'Beetle',
        'Caddy',
        'California', 'Grand California',
        'Golf', 'Golf R', 'Golf Variant',
        'GTI',
        'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.7', 'ID. Buzz',
        'Jetta', 'GLI',
        'Multivan',
        'Passat', 'Passat Variant',
        'Polo', 'Polo GTI',
        'Scirocco',
        'Sharan',
        'T-Cross',
        'Taigo',
        'Taos',
        'Tiguan', 'Tiguan Allspace',
        'Touareg',
        'Touran',
        'T-Roc', 'T-Roc Cabriolet',
        'Up!', 'e-Up!'
    ]
};


/**
 * Returns an array of models for a given make.
 * @param {string} make - The selected car make.
 * @returns {string[]} - An array of model names or an empty array.
 */
export const getModelsForMake = (make) => {
    return carModelsByMake[make] || [];
};

/**
 * Generates a list of years from current year + 1 down to a minimum year.
 * @param {number} [startYear=1950] - The oldest year to include.
 * @returns {number[]} - An array of years.
 */
export const getYearOptions = (startYear = 1950) => {
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 1; // Allow listing for next year's models
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
        years.push(year);
    }
    return years;
};