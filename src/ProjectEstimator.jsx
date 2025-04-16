import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Project Estimator Tool</h1>
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Project Name</Label><Input name="projectName" value={formData.projectName} onChange={e => setFormData({ ...formData, projectName: e.target.value })} /></div>
            <div><Label>Project Number</Label><Input name="projectNumber" value={formData.projectNumber} onChange={e => setFormData({ ...formData, projectNumber: e.target.value })} /></div>
            <div><Label>Client</Label><Input name="client" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
  <div>
    <Label>Sector</Label>
    <select name="sector" value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} className="w-full border rounded p-2">
      <option value="">Select</option>
      <option value="Water">Water</option>
      <option value="Energy">Energy</option>
      <option value="Bespoke Precast">Bespoke Precast</option>
    </select>
  </div>
  <div>
    <Label>Product Type</Label>
    <select name="productType" value={formData.productType} onChange={e => setFormData({ ...formData, productType: e.target.value })} className="w-full border rounded p-2">
      <option value="">Select</option>
      {sectorProductMap[formData.sector]?.map((type, idx) => (
        <option key={idx} value={type}>{type}</option>
      ))}
    </select>
  </div>
</div>
<div className="grid grid-cols-3 gap-4">
  <div><Label>Length (m)</Label><Input name="length" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} type="number" /></div>
  <div><Label>Width (m)</Label><Input name="width" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} type="number" /></div>
  <div><Label>Height (m)</Label><Input name="height" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} type="number" /></div>
  <div><Label>Base Thickness (m)</Label><Input name="baseThickness" value={formData.baseThickness} onChange={e => setFormData({ ...formData, baseThickness: e.target.value })} type="number" /></div>
  <div><Label>Wall Thickness (m)</Label><Input name="wallThickness" value={formData.wallThickness} onChange={e => setFormData({ ...formData, wallThickness: e.target.value })} type="number" /></div>
</div>
<div className="grid grid-cols-3 gap-4">
  <div><Label>Lid Units</Label><Input name="lidUnits" value={formData.lidUnits} onChange={e => setFormData({ ...formData, lidUnits: e.target.value })} type="number" /></div>
  <div><Label>Pipe Openings Units</Label><Input name="pipeOpeningsUnits" value={formData.pipeOpeningsUnits} onChange={e => setFormData({ ...formData, pipeOpeningsUnits: e.target.value })} type="number" /></div>
  <div><Label>Ladder Rungs Units</Label><Input name="ladderRungsUnits" value={formData.ladderRungsUnits} onChange={e => setFormData({ ...formData, ladderRungsUnits: e.target.value })} type="number" /></div>
</div>
<div>
  <Label>Duct Type</Label>
  <select name="ductType" value={formData.ductType} onChange={e => setFormData({ ...formData, ductType: e.target.value })} className="w-full border rounded p-2">
    <option value="">Select</option>
    <option value="Duct type 1">Duct type 1</option>
    <option value="Duct type 2">Duct type 2</option>
    <option value="Duct type 3">Duct type 3</option>
    <option value="Duct type 4">Duct type 4</option>
  </select>
</div>
<div>
  <Label>Transport</Label>
  <select name="transport" value={formData.transport} onChange={e => setFormData({ ...formData, transport: e.target.value })} className="w-full border rounded p-2">
    <option value="">Select</option>
    <option value="Cork">Cork (€850)</option>
    <option value="Dublin">Dublin (€650)</option>
    <option value="UK">UK (€2000)</option>
  </select>
</div>
<div>
  <Label>Installation Duration (days)</Label>
  <Input name="installationDays" value={formData.installationDays} onChange={e => setFormData({ ...formData, installationDays: e.target.value })} type="number" />
</div>
<div>
  <Label>Profitability Margin: {formData.margin}%</Label>
  <input type="range" min="0" max="100" name="margin" value={formData.margin} onChange={e => setFormData({ ...formData, margin: e.target.value })} className="w-full" />
</div>

          <Button onClick={() => {
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
              ]
            });
          }}>Generate Estimate</Button>
        
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
</CardContent>
      </Card>
    </div>
  );
}
