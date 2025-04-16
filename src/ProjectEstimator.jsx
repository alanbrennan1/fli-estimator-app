import React, { useState } from 'react';

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
    const m3 = parseFloat(formData.length) * parseFloat(formData.width) * parseFloat(formData.height);
    const concreteVolume = m3 + parseFloat(formData.baseThickness) + parseFloat(formData.wallThickness);
    const steelKg = 120 * concreteVolume;
    const weightTn = concreteVolume * 2.6;
    const labourHrs = weightTn * 4.2;
    const concreteCost = 137.21 * concreteVolume;
    const steelCost = 0.8 * steelKg;
    const labourCost = 70.11 * labourHrs;
    const additionalCost = additionalItems.lid * parseInt(formData.lidUnits) +
      additionalItems.pipeOpenings * parseInt(formData.pipeOpeningsUnits) +
      additionalItems.ladderRungs * parseInt(formData.ladderRungsUnits);
    const transportCost = transportCosts[formData.transport] || 0;
    const installationCost = parseFloat(formData.installationDays || 0) * 500;

    let total = concreteCost + steelCost + labourCost + additionalCost + transportCost + installationCost;
    total *= 1 + parseFloat(formData.margin) / 100;

    setEstimate(total.toFixed(2));

    setBreakdown({
      Concrete: [
        { label: 'Concrete Volume', value: concreteVolume.toFixed(2), unit: 'm³', isCurrency: false },
        { label: 'Concrete Cost', value: concreteCost.toFixed(2), isCurrency: true }
      ],
      Steel: [
        { label: 'Steel Required', value: steelKg.toFixed(2), unit: 'kg', isCurrency: false },
        { label: 'Steel Cost', value: steelCost.toFixed(2), isCurrency: true }
      ],
      Labour: [
        { label: 'Labour Hours', value: labourHrs.toFixed(2), unit: 'hrs', isCurrency: false },
        { label: 'Labour Cost', value: labourCost.toFixed(2), isCurrency: true }
      ],
      installation: [
        { label: 'Installation Days', value: formData.installationDays || 0, unit: 'days', isCurrency: false },
        { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true }
      ]
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">FLI Project Estimator Tool</h1>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div><label>Project Name</label><input className="border p-2 w-full" name="projectName" value={formData.projectName} onChange={handleChange} /></div>
          <div><label>Project Number</label><input className="border p-2 w-full" name="projectNumber" value={formData.projectNumber} onChange={handleChange} /></div>
          <div><label>Client</label><input className="border p-2 w-full" name="client" value={formData.client} onChange={handleChange} /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Sector</label>
            <select name="sector" value={formData.sector} onChange={handleChange} className="w-full border p-2">
              <option value="">Select</option>
              {Object.keys(sectorProductMap).map((sector, idx) => (
                <option key={idx} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Product Type</label>
            <select name="productType" value={formData.productType} onChange={handleChange} className="w-full border p-2">
              <option value="">Select</option>
              {(sectorProductMap[formData.sector] || []).map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['length','width','height','baseThickness','wallThickness'].map(field => (
            <div key={field}>
              <label>{field.replace(/([A-Z])/g, ' $1')} (m)</label>
              <input name={field} type="number" className="border p-2 w-full" value={formData[field]} onChange={handleChange} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['lidUnits','pipeOpeningsUnits','ladderRungsUnits'].map(field => (
            <div key={field}>
              <label>{field.replace(/([A-Z])/g, ' $1')}</label>
              <input name={field} type="number" className="border p-2 w-full" value={formData[field]} onChange={handleChange} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Duct Type</label>
            <select name="ductType" value={formData.ductType} onChange={handleChange} className="w-full border p-2">
              <option value="">Select</option>
              {['Duct type 1', 'Duct type 2', 'Duct type 3', 'Duct type 4'].map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Transport</label>
            <select name="transport" value={formData.transport} onChange={handleChange} className="w-full border p-2">
              <option value="">Select</option>
              {Object.keys(transportCosts).map((location, idx) => (
                <option key={idx} value={location}>{location} (€{transportCosts[location]})</option>
              ))}
            </select>
          </div>
          <div>
            <label>Installation Duration (days)</label>
            <input name="installationDays" type="number" className="border p-2 w-full" value={formData.installationDays} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label>Profitability Margin: {formData.margin}%</label>
          <input type="range" min="0" max="100" name="margin" value={formData.margin} onChange={handleChange} className="w-full" />
        </div>

        <button onClick={handleEstimate} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Estimate</button>

        {estimate && (
          <>
            <div className="text-xl font-semibold pt-4">Estimated Price: €{estimate}</div>
            <div className="pt-4 space-y-2">
              {Object.entries(breakdown).map(([section, items]) => (
                <div key={section} className="border rounded p-3">
                  <h3 className="font-semibold border-b mb-2 capitalize">{section}</h3>
                  <ul className="space-y-1 text-sm">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.isCurrency ? `€${item.value}` : `${item.value} ${item.unit}`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="text-right text-lg font-bold pt-4">Grand Total: €{estimate}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
