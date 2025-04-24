import React, { useState } from 'react';
import './index.css';

export default function ProjectEstimator() {
  const sectorProductMap = {
    Water: ['Baffle Walls', 'Contact Tanks'],
    Energy: ['Cable Troughs', 'Blast Walls'],
    'Bespoke Precast': ['Foundation Bases', 'Cover Slabs'],
  };

const [additionalItems] = useState({
  lid: 30,             // Fixed price for lid
  pipeOpenings: 50,    // Fixed price for pipe opening
  ladderRungs: 100     // Fixed price for ladder rung
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
    steelGrade: '',
    proposalHours: '',
    designMeetingsHours: '',
    structuralDesignHours: '',
    revitModelHours: '',
    approvalCommentsHours: '',
    detailingJointsHours: '',
    detailingFloorsHours: '',
    detailingScreedHours: '',
    gasHours: '',
    productionUnitsHours: '',
    productionCheckingHours: '',
    siteQueriesHours: '',
    asBuiltsHours: '',
    concreteVolume: '',
    transport: ''
  });

  const [estimate, setEstimate] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [pendingImport, setPendingImport] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleEstimate = () => {
  const safe = (val) => parseFloat(val || 0);
  const safeInt = (val) => parseInt(val || '0', 10);

  // 👇 use concrete volume from form (manually or CSV-injected)
  const concreteVolume = safe(formData.concreteVolume) || (m3 + safe(formData.baseThickness) + safe(formData.wallThickness));
    console.log("Concrete Volume:", concreteVolume);

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex items-center">
        <img src="/fli logo.png" alt="FLI Precast Solutions" className="h-10 mr-4" />
        <h1 className="text-2xl font-bold text-blue-800">FLI Project Estimator Tool</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* 🧾 Project Info */}
<section className="space-y-4">
<h2 className="text-xl font-semibold text-teal-700 mb-2">Project Info</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Project Name</label>
      <input name="projectName" value={formData.projectName} onChange={handleChange} className="border p-2 rounded" />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Project Number</label>
      <input name="projectNumber" value={formData.projectNumber} onChange={handleChange} className="border p-2 rounded" />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Client</label>
      <input name="client" value={formData.client} onChange={handleChange} className="border p-2 rounded" />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Sector</label>
      <select name="sector" value={formData.sector} onChange={handleChange} className="border p-2 rounded">
        <option value="">Select Sector</option>
        {Object.keys(sectorProductMap).map((sector, idx) => (
          <option key={idx} value={sector}>{sector}</option>
        ))}
      </select>
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Product Type</label>
      <select name="productType" value={formData.productType} onChange={handleChange} className="border p-2 rounded">
        <option value="">Select Product Type</option>
        {(sectorProductMap[formData.sector] || []).map((type, idx) => (
          <option key={idx} value={type}>{type}</option>
        ))}
      </select>
    </div>
  </div>
</section>



        
{/* 🏗 Manufacturing */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold text-teal-700 mb-2">Manufacturing</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {['length', 'width', 'height', 'baseThickness', 'wallThickness'].map((field) => {
      const labelMap = {
        length: 'Length (m)',
        width: 'Width (m)',
        height: 'Height (m)',
        baseThickness: 'Base Thickness (m)',
        wallThickness: 'Wall Thickness (m)'
      };
      return (
        <div key={field} className="flex flex-col">
          <label className="text-sm font-medium mb-1">{labelMap[field]}</label>
          <input
            name={field}
            type="number"
            value={formData[field]}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
      );
    })}
  </div>


  
  {/* Calculated Fields */}

{/* Editable Manufacturing Totals */}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Concrete Volume (m³)</label>
    <input
      name="concreteVolume"
      type="number"
      value={formData.concreteVolume || ''}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Steel Grade (kg/m³)</label>
    <select
      name="steelGrade"
      value={formData.steelGrade}
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">Select Steel Grade</option>
      <option value="B125">B125</option>
      <option value="C250">C250</option>
      <option value="D400">D400</option>
      <option value="E600">E600</option>
      <option value="Other">Other</option>
    </select>
  </div>
    
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">Labour Hours</label>
    <input
      name="labourHours"
      type="number"
      value={formData.labourHours || ''}
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

</div>
 
</section>


{/* ➕ Additional Items */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold text-teal-700 mb-2">Additional Items</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      "lidUnits",
      "pipeOpeningsUnits",
      "ladderRungsUnits",
      "wBarScabbling",
      "liftersCapstans",
      "mkkCones",
      "unistrut",
      "sikaPowder",
      "pullingIrons",
      "earthingPoints",
      "sumpGates",
      "polyfleece"
    ].map((field) => {
      const labelMap = {
        lidUnits: "Lid Units",
        pipeOpeningsUnits: "Pipe Openings",
        ladderRungsUnits: "Ladder Rungs",
        wBarScabbling: "W.Bar & Scabbling",
        liftersCapstans: "Lifters & Capstans",
        mkkCones: "MKK Cones",
        unistrut: "Unistrut",
        sikaPowder: "Sika Powder",
        pullingIrons: "Pulling Irons",
        earthingPoints: "Earthing Points",
        sumpGates: "Sump Gates",
        polyfleece: "Polyfleece"
      };
      return (
        <div key={field} className="flex flex-col">
          <label className="text-sm font-medium mb-1">{labelMap[field]}</label>
          <input
            type="number"
            name={field}
            value={formData[field] || ''}
            onChange={handleChange}
            placeholder="Quantity"
            className="border p-2 rounded"
          />
        </div>
      );
    })}

    {/* Duct Type Dropdown */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Duct Type</label>
      <select
        name="ductType"
        value={formData.ductType}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Select Duct Type</option>
        <option value="Duct type 1">Duct type 1</option>
        <option value="Duct type 2">Duct type 2</option>
        <option value="Duct type 3">Duct type 3</option>
        <option value="Duct type 4">Duct type 4</option>
      </select>
    </div>
  </div>
</section>


{/* 🎨 Design Section */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold text-teal-700 mb-2">Design</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[
      { name: 'proposalHours', label: 'Proposal' },
      { name: 'designMeetingsHours', label: 'Design Meetings' },
      { name: 'structuralDesignHours', label: 'Structural Design' },
      { name: 'revitModelHours', label: 'Revit Model' },
      { name: 'approvalCommentsHours', label: 'Approval Comments' },
      { name: 'detailingJointsHours', label: 'Detailing In-Situ Joints' },
      { name: 'detailingFloorsHours', label: 'Detailing In-Situ Floors' },
      { name: 'detailingScreedHours', label: 'Detailing In-Situ Screed' },
      { name: 'gasHours', label: "GA’s" },
      { name: 'productionUnitsHours', label: 'Production Units' },
      { name: 'productionCheckingHours', label: 'Production Checking' },
      { name: 'siteQueriesHours', label: 'Site Queries' },
      { name: 'asBuiltsHours', label: 'As Builts' }
    ].map((item) => (
      <div key={item.name} className="flex flex-col">
        <label className="text-sm font-medium mb-1">{item.label} </label>
        <input
          type="number"
          name={item.name}
          value={formData[item.name] || ''}
          onChange={handleChange}
          placeholder="Hours"
          className="border p-2 rounded"
        />
      </div>
    ))}
  </div>
</section>

      
{/* 🚚 Transport */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold text-teal-700 mb-2">Transport</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Transport Location</label>
      <select
        name="transport"
        value={formData.transport}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="">Select Transport</option>
        {Object.keys(transportCosts).map((place, idx) => (
          <option key={idx} value={place}>
            {place} (€{transportCosts[place]})
          </option>
        ))}
      </select>
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Transport Quantity</label>
      <input
        type="number"
        name="transportQuantity"
        value={formData.transportQuantity || ''}
        onChange={handleChange}
        className="border p-2 rounded"
      />
    </div>
  </div>
</section>


        {/* 🛠 Installation Days */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold text-teal-700 mb-2">Installation</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Installation Duration (Days)</label>
      <input
        type="number"
        name="installationDays"
        value={formData.installationDays}
        onChange={handleChange}
        placeholder="Days"
        className="border p-2 rounded"
      />
    </div>
  </div>
</section>

        

      

        <div>
          <label className="block text-sm font-medium mb-1">Profitability Margin: {formData.margin}%</label>
          <input type="range" min="0" max="100" name="margin" value={formData.margin} onChange={handleChange} className="w-full" />
        </div>


        
<div className="border-dashed border-2 border-gray-400 rounded p-4 my-6">
  <label className="block mb-2 font-medium">Import from SketchUp Export (.csv)</label>

  <input
  type="file"
  accept=".csv"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text
        .split('\n')
        .map(row => row.split(',').map(cell => cell.trim()))
        .filter(row => row.length >= 2); // Filter out empty or malformed rows

      const headers = rows[0];
      const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('quantity'));
      const volumeIndex = headers.findIndex(h => h.toLowerCase().includes('entity volume'));

      if (quantityIndex === -1 || volumeIndex === -1) {
        alert("CSV must include 'Quantity' and 'Entity Volume' columns");
        return;
      }

      let totalVolume = 0;
      for (let i = 1; i < rows.length; i++) {
        const quantityRaw = rows[i][quantityIndex];
        const volumeRaw = rows[i][volumeIndex];

        const quantity = parseFloat(quantityRaw);
        const volume = parseFloat(
          volumeRaw
            .replace('cubic m', '')
            .replace('m³', '')
            .replace(/[^0-9.]/g, '') // remove non-numeric except dot
            .trim()
        );

        if (!isNaN(quantity) && !isNaN(volume)) {
          totalVolume += quantity * volume;
        }
      }

      const concreteCost = totalVolume * 137.21;

      setFormData(prev => ({
        ...prev,
        concreteVolume: totalVolume.toFixed(2)
      }));

      setBreakdown(prev => ({
        ...prev,
        concrete: [
          { label: 'Total Concrete Volume', value: totalVolume.toFixed(2), unit: 'm³', isCurrency: false },
          { label: 'Concrete Cost', value: concreteCost.toFixed(2), isCurrency: true }
        ]
      }));
    };

    reader.readAsText(file);
  }}
  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
/>
  
</div>

{pendingImport && (
  <div className="bg-white border border-gray-300 rounded p-4 mt-4 space-y-2">
    <h4 className="font-semibold mb-2">Preview Imported Values</h4>
    {Object.entries(pendingImport).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm">
        <span className="capitalize">{key}</span>
        <span>{value}</span>
      </div>
    ))}
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => {
          setFormData(prev => ({
            ...prev,
            ...pendingImport
          }));
          setPendingImport(null);
        }}
        className="bg-green-600 text-white px-4 py-1 rounded"
      >
        Use These Values
      </button>
      <button
        onClick={() => setPendingImport(null)}
        className="bg-gray-400 text-white px-4 py-1 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}




        
        <button onClick={handleEstimate} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Estimate</button>

        {estimate && (
  <div id="quote-preview" className="pt-6 space-y-4">

    <div className="text-xl font-semibold">Estimated Price: €{estimate}</div>

    <div className="pt-4 space-y-4">
      {Object.entries(breakdown).map(([section, items]) => {
        const subtotal = items.reduce((sum, i) => sum + (i.isCurrency ? parseFloat(i.value) : 0), 0);
        return (
          <div key={section} className="bg-gray-50 border rounded p-4">
            <h3 className="font-semibold border-b pb-1 mb-2 capitalize text-blue-700">{section}</h3>
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

      {/* ✅ Export Buttons: CSV + PDF */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => {
            const now = new Date().toLocaleString();
            const rows = [
              ['FLI Precast Solutions'],
              [`Quote for: ${formData.projectName || 'Unnamed Project'}`],
              [`Client: ${formData.client || 'N/A'}`],
              [`Generated: ${now}`],
              [],
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
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>

        <button
          onClick={() => {
            const content = document.getElementById('quote-preview');
            if (!content) return;
            import('html2pdf.js').then(html2pdf => {
              html2pdf.default().from(content).save(`${formData.projectName || 'quote'}_BoQ.pdf`);
            });
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>
    </div>
  </div>
)}

        
      </main>
    </div>
  );
}
