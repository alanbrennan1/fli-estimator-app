export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  const {
    projectName,
    client,
    sector,
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
  const labourHoursPerTon = 4.2;
  const concreteDensity = 2.6;
  const steelKgPerM3 = 120;
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
      steelDensity = steelKgPerM3,
      labourHours,
      uniqueItems = []
    } = product;

    const concreteVolume =
      safe(length) * safe(width) * safe(height) +
      safe(baseThickness) + safe(wallThickness);
    const concreteCost = concreteRate * concreteVolume;

    const steelKg = steelDensity * concreteVolume;
    const steelCost = steelKg * steelRate;

    const weightTn = concreteVolume * concreteDensity;
    const labourHrs = labourHours || weightTn * labourHoursPerTon;
    const labourCost = labourHrs * labourRate;

    let additionalItems = [];
    let additionalCost = 0;
    uniqueItems.forEach((item) => {
      const cost = (item.qty || 0) * 50; // Default unit price
      additionalItems.push({
        label: item.item,
        qty: item.qty,
        cost: parseFloat(cost.toFixed(2))
      });
      additionalCost += cost;
    });

    const total = concreteCost + steelCost + labourCost + additionalCost;

    productBreakdowns.push({
      name,
      productCode: code,
      quantity,
      concrete: {
        volume: parseFloat(concreteVolume.toFixed(2)),
        cost: parseFloat(concreteCost.toFixed(2))
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
    subtotals.concrete.units += concreteVolume;
    subtotals.steel.cost += steelCost;
    subtotals.steel.units += steelKg;
    subtotals.labour.cost += labourCost;
    subtotals.labour.units += labourHrs;
    subtotals.additional.cost += additionalCost;
    subtotals.additional.units += uniqueItems.length;
  });

  const totalDesignHours = Object.values(designHours).reduce(
    (acc, val) => acc + safe(val),
    0
  );
  const designCost = totalDesignHours * designHourRate;
  const transportCost = transportRate * transportQuantity;
  const installationCost = installationDays * installationDayRate;

  const services = [
    {
      label: "Design",
      units: totalDesignHours,
      unitLabel: "hours",
      unitPrice: designHourRate,
      value: parseFloat(designCost.toFixed(2))
    },
    {
      label: "Transport",
      units: transportQuantity,
      unitLabel: "loads",
      unitPrice: transportRate,
      value: parseFloat(transportCost.toFixed(2))
    },
    {
      label: "Installation",
      units: installationDays,
      unitLabel: "days",
      unitPrice: installationDayRate,
      value: parseFloat(installationCost.toFixed(2))
    }
  ];

  let rawTotal =
    subtotals.concrete.cost +
    subtotals.steel.cost +
    subtotals.labour.cost +
    subtotals.additional.cost +
    designCost +
    transportCost +
    installationCost;

  rawTotal *= 1 + safe(wasteMargin) / 100;
  rawTotal *= 1 + safe(groupCost) / 100;
  rawTotal *= 1 + safe(margin) / 100;

  return res.status(200).json({
    estimate: parseFloat(rawTotal.toFixed(2)),
    breakdown: {
      productBreakdowns,
      subtotals: {
        concrete: {
          cost: parseFloat(subtotals.concrete.cost.toFixed(2)),
          units: parseFloat(subtotals.concrete.units.toFixed(2))
        },
        steel: {
          cost: parseFloat(subtotals.steel.cost.toFixed(2)),
          units: parseFloat(subtotals.steel.units.toFixed(2))
        },
        labour: {
          cost: parseFloat(subtotals.labour.cost.toFixed(2)),
          units: parseFloat(subtotals.labour.units.toFixed(2))
        },
        additional: {
          cost: parseFloat(subtotals.additional.cost.toFixed(2)),
          units: parseFloat(subtotals.additional.units.toFixed(2))
        }
      },
      services
    }
  });
}
