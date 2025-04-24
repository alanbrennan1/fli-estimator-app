import React, { useState } from 'react';
import './index.css';

export default function ProjectEstimator() {
  const sectorProductMap = {
    Water: ['Baffle Walls', 'Contact Tanks'],
    Energy: ['Cable Troughs', 'Blast Walls'],
    'Bespoke Precast': ['Foundation Bases', 'Cover Slabs']
  };

  const steelOptions = {
    B125: 100,
    C250: 120,
    D400: 140,
    E600: 160,
    Other: 120
  };

  const transportCosts = {
    Cork: 850,
    Dublin: 650,
    UK: 2000
  };

  const [formData, setFormData] = useState({
    projectName: '',
    projectNumber: '',
    client: '',
    sector: '',
    productType: '',
    length: '',
    width: '',
    height: '',
    baseThickness: '',
    wallThickness: '',
    steelGrade: 'C250',
    lidUnits: '',
    pipeOpeningsUnits: '',
    ladderRungsUnits: '',
    ductType: '',
    installationDays: '',
    transport: '',
    transportQuantity: '',
    margin: 0,
    design: {},
    extras: {}
  });

  const [estimate, setEstimate] = useState(null);
  const [breakdown, setBreakdown] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, name, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleEstimate = () => {
    const safe = val => parseFloat(val || 0);
    const safeInt = val => parseInt(val || '0', 10);

    const m3 = safe(formData.length) * safe(formData.width) * safe(formData.height);
    const concreteVolume = m3 + safe(formData.baseThickness) + safe(formData.wallThickness);
    const steelKg = steelOptions[formData.steelGrade] * concreteVolume;
    const weightTn = concreteVolume * 2.6;
    const labourHrs = weightTn * 4.2;

    const concreteCost = 137.21 * concreteVolume;
    const steelCost = 0.8 * steelKg;
    const labourCost = 70.11 * labourHrs;
    const lidCost = 30 * safeInt(formData.lidUnits);
    const pipeCost = 50 * safeInt(formData.pipeOpeningsUnits);
    const ladderCost = 100 * safeInt(formData.ladderRungsUnits);
    const transportCost = transportCosts[formData.transport] || 0;
    const installationCost = 500 * safeInt(formData.installationDays);

    let total = concreteCost + steelCost + labourCost + lidCost + pipeCost + ladderCost + transportCost + installationCost;
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
      additional: [
        { label: 'Lid Cost', value: lidCost.toFixed(2), isCurrency: true },
        { label: 'Pipe Openings Cost', value: pipeCost.toFixed(2), isCurrency: true },
        { label: 'Ladder Rungs Cost', value: ladderCost.toFixed(2), isCurrency: true }
      ],
      transport: [
        { label: 'Transport Cost', value: transportCost.toFixed(2), isCurrency: true }
      ],
      installation: [
        { label: 'Installation Cost', value: installationCost.toFixed(2), isCurrency: true }
      ]
    });
  };

  const handleExportCSV = () => {
    const now = new Date().toLocaleString();
    const rows = [
      ['FLI Precast Solutions'],
      [`Quote for: ${formData.projectName || 'Unnamed Project'}`],
      [`Client: ${formData.client || 'N/A'}`],
      [`Generated: ${now}`],
      []
    ];

    Object.entries(breakdown).forEach(([section, items]) => {
      rows.push([`${section.toUpperCase()} BREAKDOWN`]);
      rows.push(['Label', 'Value']);
      items.forEach(item => {
        rows.push([
          item.label,
          item.isCurrency ? `€${item.value}` : `${item.value} ${item.unit || ''}`
        ]);
      });
      rows.push([]);
    });

    rows.push(['Grand Total', `€${estimate}`]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${formData.projectName || 'quote'}_BoQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const content = document.getElementById('quote-preview');
    if (!content) return;
    import('html2pdf.js').then(html2pdf => {
      html2pdf.default().from(content).save(`${formData.projectName || 'quote'}_BoQ.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex items-center">
        <img src="/fli logo.png" alt="FLI Precast Solutions" className="h-10 mr-4" />
        <h1 className="text-2xl font-bold text-blue-800">FLI Project Estimator Tool</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Form sections omitted here to save space */}
        <button onClick={handleEstimate} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Estimate</button>

        {estimate && (
          <div id="quote-preview" className="pt-6 space-y-4">
            <div className="text-xl font-semibold">Estimated Price: €{estimate}</div>
            {Object.entries(breakdown).map(([section, items]) => {
              const subtotal = items.reduce((sum, i) => sum + (i.isCurrency ? parseFloat(i.value) : 0), 0);
              return (
                <div key={section} className="bg-white shadow rounded p-4">
                  <h3 className="font-semibold mb-2">{section.toUpperCase()}</h3>
                  <ul className="space-y-1 text-sm">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.isCurrency ? `€${item.value}` : `${item.value} ${item.unit}`}</span>
                      </li>
                    ))}
                    <li className="flex justify-between font-semibold border-t pt-1 mt-2">
                      <span>Subtotal</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
              );
            })}
            <div className="text-right text-lg font-bold pt-2 border-t">Grand Total: €{estimate}</div>
            <div className="flex gap-4 pt-6">
              <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export CSV</button>
              <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
