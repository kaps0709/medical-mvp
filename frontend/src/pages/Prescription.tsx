import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Trash2, Printer, Download, Stethoscope } from "lucide-react";
import { mockPrescriptions } from "@/lib/mockData";

export default function Prescription() {
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get("id");
  const existingPrescription = mockPrescriptions.find((p) => p.id === prescriptionId);

  const [medicines, setMedicines] = useState(
    existingPrescription?.medicines || [
      { id: "1", name: "", dosage: "", frequency: "", duration: "" }
    ]
  );
  const [advice, setAdvice] = useState(existingPrescription?.advice || "");
  const [patientName] = useState(existingPrescription?.patientName || "John Smith");
  const [date] = useState(existingPrescription?.date || new Date().toISOString().split("T")[0]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" }
    ]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: string, value: string) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescription Generator</h1>
          <p className="text-muted-foreground mt-1">Create and manage patient prescriptions</p>
        </div>
      </div>

      {/* Prescription Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient Name</Label>
              <Input id="patient" value={patientName} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} readOnly className="bg-muted" />
            </div>
          </div>

          <Separator />

          {/* Medicines Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Medicines</h3>
              <Button variant="outline" size="sm" onClick={addMedicine} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell>
                        <Input
                          value={medicine.name}
                          onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)}
                          placeholder="e.g., Amoxicillin"
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(medicine.id, "dosage", e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(medicine.id, "frequency", e.target.value)}
                          placeholder="e.g., Twice daily"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(medicine.id, "duration", e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMedicine(medicine.id)}
                          disabled={medicines.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Advice */}
          <div className="space-y-2">
            <Label htmlFor="advice">Additional Advice & Instructions</Label>
            <Textarea
              id="advice"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Enter medical advice, dietary instructions, or follow-up recommendations..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Print Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Print Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white text-black p-8 rounded-lg border-2 border-border space-y-6">
            {/* Header */}
            <div className="text-center border-b-2 border-primary pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Dr. John Smith</h2>
                  <p className="text-sm text-gray-600">MBBS, MD - General Medicine</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">City Medical Clinic | +1 (555) 000-0000</p>
            </div>

            {/* Patient & Date */}
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-semibold">Patient: {patientName}</p>
              </div>
              <div>
                <p className="font-semibold">Date: {new Date(date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Prescription Symbol */}
            <div className="text-4xl font-serif text-primary">℞</div>

            {/* Medicines */}
            <div className="space-y-3">
              {medicines.filter(m => m.name).map((medicine, index) => (
                <div key={medicine.id} className="border-l-2 border-primary pl-4">
                  <p className="font-semibold">{index + 1}. {medicine.name}</p>
                  <p className="text-sm text-gray-700">
                    Dosage: {medicine.dosage} | {medicine.frequency} | Duration: {medicine.duration}
                  </p>
                </div>
              ))}
            </div>

            {/* Advice */}
            {advice && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold mb-2">Medical Advice:</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{advice}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-300 text-right">
              <div className="inline-block">
                <p className="text-sm font-semibold">Dr. John Smith</p>
                <p className="text-xs text-gray-600">Signature & Stamp</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="lg" className="flex-1 gap-2">
              <Printer className="w-4 h-4" />
              Print Prescription
            </Button>
            <Button size="lg" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
