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
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">FLI Project Estimator Tool</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-sm font-medium mb-1">Project Name</label><input className="border p-2 w-full rounded" name="projectName" value={formData.projectName} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium mb-1">Project Number</label><input className="border p-2 w-full rounded" name="projectNumber" value={formData.projectNumber} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium mb-1">Client</label><input className="border p-2 w-full rounded" name="client" value={formData.client} onChange={handleChange} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sector</label>
            <select name="sector" value={formData.sector} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select</option>
              {Object.keys(sectorProductMap).map((sector, idx) => (
                <option key={idx} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <select name="productType" value={formData.productType} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select</option>
              {(sectorProductMap[formData.sector] || []).map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {["Length", "Width", "Height", "BaseThickness", "WallThickness"].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field.replace(/([A-Z])/g, ' $1')} (m)</label>
              <input name={field} type="number" className="border p-2 w-full rounded" value={formData[field]} onChange={handleChange} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {["lidUnits", "pipeOpeningsUnits", "ladderRungsUnits"].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input name={field} type="number" className="border p-2 w-full rounded" value={formData[field]} onChange={handleChange} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duct Type</label>
            <select name="ductType" value={formData.ductType} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select</option>
              {["Duct type 1", "Duct type 2", "Duct type 3", "Duct type 4"].map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transport</label>
            <select name="transport" value={formData.transport} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="">Select</option>
              {Object.keys(transportCosts).map((location, idx) => (
                <option key={idx} value={location}>{location} (€{transportCosts[location]})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Installation Duration (days)</label>
            <input name="installationDays" type="number" className="border p-2 w-full rounded" value={formData.installationDays} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profitability Margin: {formData.margin}%</label>
          <input type="range" min="0" max="100" name="margin" value={formData.margin} onChange={handleChange} className="w-full" />
        </div>

        <button onClick={handleEstimate} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition">Generate Estimate</button>

        {estimate && (
          <>
            <div className="text-xl font-semibold pt-6">Estimated Price: €{estimate}</div>
            <div className="pt-4 space-y-4">
              {Object.entries(breakdown).map(([section, items]) => (
                <div key={section} className="bg-gray-50 border rounded p-4">
                  <h3 className="font-semibold border-b pb-1 mb-2 capitalize text-blue-700">{section}</h3>
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
              <div className="text-right text-lg font-bold pt-2 border-t">Grand Total: €{estimate}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
