/**
 * Festivos de Barcelona (España)
 * Incluye festivos nacionales, autonómicos (Cataluña) y locales (Barcelona)
 */

// Festivos fijos (mismo día cada año)
const festivosFijos = {
  "01-01": "Año Nuevo",
  "01-06": "Reyes Magos",
  "04-23": "Sant Jordi",
  "05-01": "Día del Trabajo",
  "06-24": "Sant Joan",
  "08-15": "Asunción de la Virgen",
  "09-11": "Diada Nacional de Cataluña",
  "10-12": "Día de la Hispanidad",
  "11-01": "Todos los Santos",
  "12-06": "Día de la Constitución",
  "12-08": "Inmaculada Concepción",
  "12-25": "Navidad",
  "12-26": "San Esteban"
};

// Festivos variables específicos por año (Pascua, La Mercè, etc.)
const festivosVariables = {
  2024: {
    "04-01": "Lunes de Pascua",
    "09-24": "La Mercè"
  },
  2025: {
    "04-21": "Lunes de Pascua",
    "09-24": "La Mercè"
  },
  2026: {
    "04-06": "Lunes de Pascua",
    "09-24": "La Mercè"
  },
  2027: {
    "03-29": "Lunes de Pascua",
    "09-24": "La Mercè"
  },
  2028: {
    "04-17": "Lunes de Pascua",
    "09-25": "La Mercè" // Cae en domingo, se traslada al lunes
  },
  2029: {
    "04-02": "Lunes de Pascua",
    "09-24": "La Mercè"
  },
  2030: {
    "04-22": "Lunes de Pascua",
    "09-24": "La Mercè"
  }
};

/**
 * Obtiene todos los festivos de un año específico
 * @param {number} year - Año a consultar
 * @returns {Object} Objeto con fechas como keys y nombres como values
 */
export const getFestivosYear = (year) => {
  const festivos = {};

  // Agregar festivos fijos
  Object.entries(festivosFijos).forEach(([fecha, nombre]) => {
    const fechaCompleta = `${year}-${fecha}`;
    festivos[fechaCompleta] = nombre;
  });

  // Agregar festivos variables del año
  if (festivosVariables[year]) {
    Object.entries(festivosVariables[year]).forEach(([fecha, nombre]) => {
      const fechaCompleta = `${year}-${fecha}`;
      festivos[fechaCompleta] = nombre;
    });
  }

  return festivos;
};

/**
 * Verifica si una fecha es festivo
 * @param {Date|string} fecha - Fecha a verificar
 * @returns {string|null} Nombre del festivo o null si no es festivo
 */
export const esFestivo = (fecha) => {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const fechaString = `${year}-${month}-${day}`;

  const festivosDelYear = getFestivosYear(year);
  return festivosDelYear[fechaString] || null;
};

/**
 * Obtiene el próximo festivo
 * @param {Date} fechaActual - Fecha actual (opcional, por defecto hoy)
 * @returns {Object|null} {fecha, nombre, diasRestantes} o null si no hay próximos festivos
 */
export const getProximoFestivo = (fechaActual = new Date()) => {
  const hoy = new Date(fechaActual);
  hoy.setHours(0, 0, 0, 0);

  const year = hoy.getFullYear();
  const festivosEsteYear = getFestivosYear(year);
  const festivosProximoYear = getFestivosYear(year + 1);

  // Combinar festivos de este año y próximo
  const todosFestivos = { ...festivosEsteYear, ...festivosProximoYear };

  // Encontrar el próximo festivo
  let proximoFestivo = null;
  let menorDiferencia = Infinity;

  Object.entries(todosFestivos).forEach(([fecha, nombre]) => {
    const fechaFestivo = new Date(fecha);
    fechaFestivo.setHours(0, 0, 0, 0);

    if (fechaFestivo >= hoy) {
      const diferenciaDias = Math.ceil((fechaFestivo - hoy) / (1000 * 60 * 60 * 24));

      if (diferenciaDias < menorDiferencia) {
        menorDiferencia = diferenciaDias;
        proximoFestivo = {
          fecha: fechaFestivo,
          fechaString: fecha,
          nombre,
          diasRestantes: diferenciaDias
        };
      }
    }
  });

  return proximoFestivo;
};

/**
 * Obtiene festivos de un mes específico
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {Array} Array de objetos {fecha, nombre}
 */
export const getFestivosMes = (year, month) => {
  const festivosDelYear = getFestivosYear(year);
  const festivosDelMes = [];

  Object.entries(festivosDelYear).forEach(([fecha, nombre]) => {
    const [yearStr, monthStr] = fecha.split('-');
    if (parseInt(yearStr) === year && parseInt(monthStr) === month) {
      festivosDelMes.push({
        fecha: new Date(fecha),
        fechaString: fecha,
        nombre
      });
    }
  });

  return festivosDelMes.sort((a, b) => a.fecha - b.fecha);
};

/**
 * Verifica si hoy es festivo
 * @returns {string|null} Nombre del festivo o null
 */
export const esHoyFestivo = () => {
  return esFestivo(new Date());
};

/**
 * Verifica si mañana es festivo
 * @returns {string|null} Nombre del festivo o null
 */
export const esMananaFestivo = () => {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return esFestivo(manana);
};