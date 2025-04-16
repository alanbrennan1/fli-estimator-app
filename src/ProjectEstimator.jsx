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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Project Estimator Tool</h1>
      <div className="grid grid-cols-3 gap-4">
        <input name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Project Name" className="border p-2 rounded" />
        <input name="projectNumber" value={formData.projectNumber} onChange={handleChange} placeholder="Project Number" className="border p-2 rounded" />
        <input name="client" value={formData.client} onChange={handleChange} placeholder="Client" className="border p-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select name="sector" value={formData.sector} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Sector</option>
          {Object.keys(sectorProductMap).map((sector, idx) => (
            <option key={idx} value={sector}>{sector}</option>
          ))}
        </select>
        <select name="productType" value={formData.productType} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Product Type</option>
          {(sectorProductMap[formData.sector] || []).map((type, idx) => (
            <option key={idx} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {['length','width','height','baseThickness','wallThickness'].map((field) => (
          <input key={field} name={field} type="number" value={formData[field]} onChange={handleChange} placeholder={field} className="border p-2 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <input name="lidUnits" type="number" value={formData.lidUnits} onChange={handleChange} placeholder="Lid Units" className="border p-2 rounded" />
        <input name="pipeOpeningsUnits" type="number" value={formData.pipeOpeningsUnits} onChange={handleChange} placeholder="Pipe Openings" className="border p-2 rounded" />
        <input name="ladderRungsUnits" type="number" value={formData.ladderRungsUnits} onChange={handleChange} placeholder="Ladder Rungs" className="border p-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select name="ductType" value={formData.ductType} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Duct Type</option>
          {["Duct type 1", "Duct type 2", "Duct type 3", "Duct type 4"].map((type, idx) => (
            <option key={idx} value={type}>{type}</option>
          ))}
        </select>
        <select name="transport" value={formData.transport} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Transport</option>
          {Object.keys(transportCosts).map((place, idx) => (
            <option key={idx} value={place}>{place} (€{transportCosts[place]})</option>
          ))}
        </select>
        <input name="installationDays" type="number" value={formData.installationDays} onChange={handleChange} placeholder="Installation Days" className="border p-2 rounded" />
      </div>
      <div>
        <label>Profitability Margin: {formData.margin}%</label>
        <input type="range" min="0" max="100" name="margin" value={formData.margin} onChange={handleChange} className="w-full" />
      </div>
      <button onClick={handleEstimate} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Estimate</button>

      {estimate && (
        <div className="pt-6">
          <div className="text-xl font-semibold">Estimated Price: €{estimate}</div>
          <div className="pt-4 space-y-4">
            {Object.entries(breakdown).map(([section, items]) => (
              <div key={section} className="bg-gray-50 border rounded p-4">
                <h3 className="font-semibold border-b pb-1 mb-2 capitalize text-blue-700">{section}</h3>
                <ul className="space-y-1 text-sm">
$1
  <li className="flex justify-between font-semibold border-t pt-1 mt-2">
    <span>Subtotal</span>
    <span>{items.reduce((sum, i) => sum + (i.isCurrency ? parseFloat(i.value) : 0), 0).toFixed(2) ? `€${items.reduce((sum, i) => sum + (i.isCurrency ? parseFloat(i.value) : 0), 0).toFixed(2)}` : ''}</span>
  </li>
</ul>
              </div>
            ))}
            <div className="text-right text-lg font-bold pt-2 border-t">Grand Total: €{estimate}</div>
          </div>
        </div>
      )}
    </div>
  );
}
