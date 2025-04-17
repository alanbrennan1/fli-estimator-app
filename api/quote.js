export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  const {
    sector,
    productType,
    length,
    width,
    height,
    baseThickness,
    wallThickness,
    lidUnits,
    pipeOpeningsUnits,
    ladderRungsUnits,
    ductType,
    installationDays,
    margin,
    transport
  } = req.body;

  const concreteRate = 137.21;
  const steelRate = 0.8;
  const labourRate = 70.11;
  const labourHoursPerTon = 4.2;
  const density = 2.6;
  const steelKgPerM3 = 120;

  const transportCosts = {
    Cork: 850,
    Dublin: 650,
    UK: 2000
  };

const additionalItems = {
  lid: 30,           // Fixed price for lid
  pipeOpenings: 50,  // Fixed price for pipe opening
  ladderRungs: 100   // Fixed price for ladder rung
};


  const m3 = safe(length) * safe(width) * safe(height);
  const concreteVolume = m3 + safe(baseThickness) + safe(wallThickness);
  const steelKg = steelKgPerM3 * concreteVolume;
  const weightTn = concreteVolume * density;
  const labourHrs = weightTn * labourHoursPerTon;

  const concreteCost = concreteRate * concreteVolume;
  const steelCost = steelRate * steelKg;
  const labourCost = labourRate * labourHrs;
  const additionalCost =
    additionalItems.lid * safeInt(lidUnits) +
    additionalItems.pipeOpenings * safeInt(pipeOpeningsUnits) +
    additionalItems.ladderRungs * safeInt(ladderRungsUnits);
  const transportCost = transportCosts[transport] || 0;
  const installationCost = safe(installationDays) * 500;

  let total = concreteCost + steelCost + labourCost + additionalCost + transportCost + installationCost;
  total *= 1 + safe(margin) / 100;

  const breakdown = {
    concrete: [
      { label: 'Concrete Volume', value: concreteVolume.toFixed(2), unit: 'm³', isCurrency: false },
      { label: 'Concrete Cost', value: concreteCost.toFixed(2), isCurrency: true }
    ],
    steel: [
      { label: 'Steel Required', value: steelKg.toFixed(2), unit: 'kg', isCurrency: false },
      { label: 'Steel Cost', value: steelCost.toFixed(2), isCurrency: true }
    ],
    labour: [
      { label: 'Labour Hours', value: labourHrs.toFixed(2), unit: 'hrs', isCurrency: false },
      { label: 'Labour Cost', value: labourCost.toFixed(2), isCurrency: true }
    ],
    installation: [
      { label: 'Installation Days', value: safe(installationDays), unit: 'days', isCurrency: false },
      { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true }
    ],
    additional: [
      { label: 'Lid Cost', value: (additionalItems.lid * safeInt(lidUnits)).toFixed(2), isCurrency: true },
      { label: 'Pipe Openings Cost', value: (additionalItems.pipeOpenings * safeInt(pipeOpeningsUnits)).toFixed(2), isCurrency: true },
      { label: 'Ladder Rungs Cost', value: (additionalItems.ladderRungs * safeInt(ladderRungsUnits)).toFixed(2), isCurrency: true }
    ],
    transport: [
      { label: 'Transport Cost', value: transportCost.toFixed(2), isCurrency: true }
    ]
  };

  return res.status(200).json({
    estimate: parseFloat(total.toFixed(2)),
    breakdown
  });
}
