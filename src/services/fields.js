// src/services/fields.js

// Объект для хранения всех конфигураций
const fields = {

  // ---- ПОЛЯ ДЛЯ МОДЕЛЕЙ ----
  // Поля по умолчанию для продукта
  productDefault: {
    id: true,
    name: true,
    subname: true,
    categoryname: true,
    wasteWeightValue: true,
    wasteWeightDesc: true,
    isDeleted: true,
    measures: true,
  },
  // Поля по умолчанию для блюда
  dishDefault: {
    id: true,
    name: true,
    description: true,
    categoryname: true,
    weight: true,
    isDeleted: true,
    dishMeasures: true,
  },

  // Используемые поля
  title: {
  },
  main: {
    kcal: true,
    mainFats: true,
    mainProteins: true,
    mainCarb: true,
    mainWater: true,
    mainAsh: true,
  },
  mainsub: {
    kcal: true,
    mainFats: true,
    mainProteins: true,
    mainCarb: true,
    mainWater: true,
    mainAsh: true,
    subSugar: true,
    subFiber: true,
    subStarch: true,
    subTransfats: true,
  },
  full: {
    kcal: true,
    mainFats: true,
    mainProteins: true,
    mainCarb: true,
    mainWater: true,
    mainAsh: true,
    subSugar: true,
    subFiber: true,
    subStarch: true,
    subTransfats: true,
    vitamin_a: true,
    beta_carotene: true,
    alpha_carotene: true,
    vitamin_e: true,
    vitamin_k: true,
    vitamin_c: true,
    vitamin_b1: true,
    vitamin_b3: true,
    vitamin_b4: true,
    vitamin_b5: true,
    vitamin_b6: true,
    vitamin_b9: true,
    vitamin_b12: true,
    vitamin_b2: true,
    vitamin_d: true,
    vitamin_d2: true,
    vitamin_d3: true,
    calcium: true,
    fluoride: true,
    iron: true,
    magnesium: true,
    phosphorus: true,
    potassium: true,
    sodium: true,
    zinc: true,
    copper: true,
    manganese: true,
    selenium: true,
  }
}

module.exports = { fields };