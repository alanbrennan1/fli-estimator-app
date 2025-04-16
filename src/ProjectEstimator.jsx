import React, { useState } from 'react';
import './index.css';

export default function ProjectEstimator() {
  const sectorProductMap = {
    Water: ['Baffle Walls', 'Contact Tanks'],
    Energy: ['Cable Troughs', 'Blast Walls'],
    'Bespoke Precast': ['Foundation Bases', 'Cover Slabs'],
  };

  const [additionalItems] = useState({
    lid: Math.floor(Math.random() * 150),
    pipeOpenings: Math.floor(Math.random() * 150),
    ladderRungs: Math.floor(Math.random() * 150),
  });

  const transportCosts = {
    Cork: 850,
    Dublin: 650,
    UK: 2000,
  };

  const [formData, setFormData] = useState({
    projectName: '',
    installationDays: '',
    projectNumber: '',
    client: '',
    sector: '',
    productType: '',
    chamberDesign: '',
    chamberUse: '',
    length: '',
    width: '',
    height: '',
    baseThickness: '',
    wallThickness: '',
    lidUnits: 0,
    pipeOpeningsUnits: 0,
    ladderRungsUnits: 0,
    ductType: '',
    margin: 0,
    transport: ''
  });

  const [estimate, setEstimate] = useState(null);
  const [breakdown, setBreakdown] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEstimate = () => {
    const safe = (val) => parseFloat(val || 0);
    const safeInt = (val) => parseInt(val || '0', 10);

    const m3 = safe(formData.length) * safe(formData.width) * safe(formData.height);
    const concreteVolume = m3 + safe(formData.baseThickness) + safe(formData.wallThickness);
    const steelKg = 120 * concreteVolume;
    const weightTn = concreteVolume * 2.6;
    const labourHrs = weightTn * 4.2;
    const concreteCost = 137.21 * concreteVolume;
    const steelCost = 0.8 * steelKg;
    const labourCost = 70.11 * labourHrs;
    const additionalCost =
      additionalItems.lid * safeInt(formData.lidUnits) +
      additionalItems.pipeOpenings * safeInt(formData.pipeOpeningsUnits) +
      additionalItems.ladderRungs * safeInt(formData.ladderRungsUnits);
    const transportCost = transportCosts[formData.transport] || 0;
    const installationCost = safe(formData.installationDays) * 500;

    let total = concreteCost + steelCost + labourCost + additionalCost + transportCost + installationCost;
    total *= 1 + safe(formData.margin) / 100;

    setEstimate(total.toFixed(2));

    setBreakdown({
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
        { label: 'Installation Days', value: formData.installationDays || 0, unit: 'days', isCurrency: false },
        { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true }
      ],
      additional: [
        { label: 'Lid Cost', value: (additionalItems.lid * safeInt(formData.lidUnits)).toFixed(2), isCurrency: true },
        { label: 'Pipe Openings Cost', value: (additionalItems.pipeOpenings * safeInt(formData.pipeOpeningsUnits)).toFixed(2), isCurrency: true },
        { label: 'Ladder Rungs Cost', value: (additionalItems.ladderRungs * safeInt(formData.ladderRungsUnits)).toFixed(2), isCurrency: true }
      ],
      transport: [
        { label: 'Transport Cost', value: transportCost.toFixed(2), isCurrency: true }
      ]
    });
  };

  return <></>; // UI omitted for brevity
}
