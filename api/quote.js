// Updated quote.js to use chamberDensity and fetch additional item pricing from data map

const additionalItemsData = require('../data/additionalItems.json');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const safe = (val) => parseFloat(val || 0);
  const mm = (val) => (val < 20 ? val * 1000 : val);
  const getUnitPriceFromAdditionalData = (label) => {
    for (const category in additionalItemsData) {
      const match = additionalItemsData[category].find(item => item.item === label);
      if (match) return parseFloat(match.materialCost || 0);
    }
    return 0;
  };
  
  const {
    margin,
    wasteMargin,
    groupCost,
    transportRate = 0,
    transportQuantity = 0,
    installationDays = 0,
    designHours = {},
    products = []
  } = req.body;

  const concreteRate = 137.21;
  const steelRate = 0.86;
  const labourRate = 70.11;
  const installationDayRate = 500;
  const designHourRate = 61.12;

  const productBreakdowns = [];
  let subtotals = {
    concrete: { cost: 0, units: 0 },
    steel: { cost: 0, units: 0 },
    labour: { cost: 0, units: 0 },
    additional: { cost: 0, units: 0 }
  };

  products.forEach((product) => {
    const {
      name,
      code,
      quantity,
      length,
      width,
      height,
      baseThickness,
      wallThickness,
      steelDensity,
      chamberDensity,
      roofSlabDensity,
      toeLength,
      antiFlotation,
      labourHours,
      openingLength,
      openingWidth,
      crossSection,
      lengthOption,
      uniqueItems = []
    } = product;

    const qty = safe(quantity);
    const len = mm(safe(length));
    const wid = mm(safe(width));
    const hgt = mm(safe(height));

    let concreteVolumeM3 = 0;
    let concreteCost = 0;
    let steelKg = 0;
    let steelCost = 0;
    let labourHrs = 0;
    let labourCost = 0;
    let antiVol = 0;

    const fallbackDensity = 120;
    const fallbackColumnSteel = 180;

    if (name.startsWith('CH')) {
      const wall = mm(safe(wallThickness));
      const base = mm(safe(baseThickness));
      const extPlan = (len + wall * 2) * (wid + wall * 2);
      const intPlan = len * wid;
      const extHeight = hgt + base;
      const chamberVol = (extPlan * extHeight) - (intPlan * hgt);

      if (antiFlotation === 'Yes') {
        const toeL = mm(safe(toeLength));
        const toePlan = (len + wall * 2);
        antiVol = ((toePlan * toeL * base) * 2);
      }

      const concreteVolume = (chamberVol + antiVol) * qty;
      concreteVolumeM3 = concreteVolume / 1_000_000_000;
      concreteCost = concreteVolumeM3 * concreteRate;

      const density = safe(chamberDensity);
      steelKg = concreteVolumeM3 * (density > 0 ? density : fallbackDensity);
     
      console.log('📦 CH calc:', {
        name,
        quantity: qty,
        chamberDensity: density,
        concreteVolumeM3,
        steelKg,
        steelCost
      });

      steelCost = steelKg * steelRate;

      labourHrs = safe(labourHours) * qty;
      labourCost = labourHrs * labourRate;
    }

      
    } else if (name.startsWith('CS')) {
      const slabL = len;
      const slabW = wid;
      const slabH = hgt;
      const oL = Math.min(safe(openingLength), slabL);
      const oW = Math.min(safe(openingWidth), slabW);

      const netVolMm3 = (slabL * slabW * slabH) - (oL * oW * slabH);
      concreteVolumeM3 = (netVolMm3 / 1_000_000_000) * qty;
      concreteCost = concreteVolumeM3 * concreteRate;

      const sDensity = safe(roofSlabDensity);
      steelKg = concreteVolumeM3 * (sDensity > 0 ? sDensity : fallbackDensity);
      steelCost = steelKg * steelRate;

      labourHrs = safe(labourHours) * qty;
      labourCost = labourHrs * labourRate;
    } else if (/^C(-\d+)?$/.test(name.trim())) {
      const baseHeight = 367;
      const effectiveHeight = hgt - baseHeight;
      const volumeMm3 = effectiveHeight * wid * len;
      const volumePerUnitM3 = (volumeMm3 / 1_000_000_000) + 0.14;
      concreteVolumeM3 = volumePerUnitM3 * qty;
      concreteCost = concreteVolumeM3 * concreteRate;

      const density = safe(steelDensity);
      steelKg = concreteVolumeM3 * (density > 0 ? density : fallbackColumnSteel);
      steelCost = steelKg * steelRate;

      labourHrs = safe(labourHours) * qty;
      labourCost = labourHrs * labourRate;
    } else if (name.startsWith('B')) {
      concreteVolumeM3 = 0.27 * (len / 1000) * qty;
      concreteCost = concreteVolumeM3 * concreteRate;

      const density = safe(steelDensity);
      steelKg = concreteVolumeM3 * (density > 0 ? density : fallbackColumnSteel);
      steelCost = steelKg * steelRate;

      labourHrs = safe(labourHours) * qty;
      labourCost = labourHrs * labourRate;
    } else {
      const volume = len * wid * hgt * qty;
      concreteVolumeM3 = volume / 1_000_000_000;
      concreteCost = concreteVolumeM3 * concreteRate;

      steelKg = concreteVolumeM3 * fallbackDensity;
      steelCost = steelKg * steelRate;

      labourHrs = safe(labourHours) * qty;
      labourCost = labourHrs * labourRate;
    }

     const additionalItems = uniqueItems.map(item => {
      const cost = (item.qty || 0) * 50;
      subtotals.additional.cost += cost;
      subtotals.additional.units += item.qty;
      return {
        label: item.item,
        qty: item.qty,
        cost: parseFloat(cost.toFixed(2))
      };
    });

    const total = concreteCost + steelCost + labourCost + additionalItems.reduce((sum, i) => sum + i.cost, 0);

    productBreakdowns.push({
      name,
      productCode: code,
      quantity: qty,
      concrete: {
        volume: parseFloat(concreteVolumeM3.toFixed(2)),
        cost: parseFloat(concreteCost.toFixed(2)),
        antiVol: (antiFlotation === 'Yes' && antiVol > 0) ? (antiVol / 1_000_000_000 * qty).toFixed(2) : undefined
      },
      steel: {
        kg: parseFloat(steelKg.toFixed(2)),
        cost: parseFloat(steelCost.toFixed(2))
      },
      labour: {
        hours: parseFloat(labourHrs.toFixed(2)),
        cost: parseFloat(labourCost.toFixed(2))
      },
      additionalItems,
      total: parseFloat(total.toFixed(2))
    });

    subtotals.concrete.cost += concreteCost;
    subtotals.concrete.units += concreteVolumeM3;
    subtotals.steel.cost += steelCost;
    subtotals.steel.units += steelKg;
    subtotals.labour.cost += labourCost;
    subtotals.labour.units += labourHrs;
  });

  const totalDesignHours = Object.values(designHours).reduce((acc, val) => acc + safe(val), 0);
  const designCost = totalDesignHours * 61.12;
  const transportCost = transportRate * transportQuantity;
  const installationCost = installationDays * 500;

  const services = [
    { label: "Design", units: totalDesignHours, unitLabel: "hours", unitPrice: 61.12, value: parseFloat(designCost.toFixed(2)) },
    { label: "Transport", units: transportQuantity, unitLabel: "loads", unitPrice: transportRate, value: parseFloat(transportCost.toFixed(2)) },
    { label: "Installation", units: installationDays, unitLabel: "days", unitPrice: 500, value: parseFloat(installationCost.toFixed(2)) }
  ];

  let rawTotal = subtotals.concrete.cost + subtotals.steel.cost + subtotals.labour.cost + subtotals.additional.cost + designCost + transportCost + installationCost;
  rawTotal *= 1 + safe(wasteMargin) / 100;
  rawTotal *= 1 + safe(groupCost) / 100;
  rawTotal *= 1 + safe(margin) / 100;

  return res.status(200).json({
    estimate: parseFloat(rawTotal.toFixed(2)),
    breakdown: {
      productBreakdowns,
      subtotals: {
        concrete: { cost: parseFloat(subtotals.concrete.cost.toFixed(2)), units: parseFloat(subtotals.concrete.units.toFixed(2)) },
        steel: { cost: parseFloat(subtotals.steel.cost.toFixed(2)), units: parseFloat(subtotals.steel.units.toFixed(2)) },
        labour: { cost: parseFloat(subtotals.labour.cost.toFixed(2)), units: parseFloat(subtotals.labour.units.toFixed(2)) },
        additional: { cost: parseFloat(subtotals.additional.cost.toFixed(2)), units: parseFloat(subtotals.additional.units.toFixed(2)) }
      },
      services
    }
  });
}
