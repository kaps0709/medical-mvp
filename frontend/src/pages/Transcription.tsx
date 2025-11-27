import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "@/api/axiosClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  MicOff,
  Save,
  FileText,
  Trash2,
  Radio,
  Plus,
  Printer,
  Stethoscope,
} from "lucide-react";

type TranscriptionStatus = "ready" | "recording" | "processing";

export default function Transcription() {
  const [status, setStatus] = useState<TranscriptionStatus>("ready");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [soapNote, setSoapNote] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medicines, setMedicines] = useState([
    { id: "1", name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [advice, setAdvice] = useState("");
  const [patientName, setPatientName] = useState("John Doe");
  const printRef = useRef<HTMLDivElement>(null);

  const handleStartStop = async () => {
    try {
      if (status === "ready") {
        setStatus("recording");

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => chunks.push(event.data);

        recorder.onstop = async () => {
          setStatus("processing");
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const transcriptionResponse = await axios.post("/ai/transcribe", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            const text = transcriptionResponse.data.transcription || "";
            setTranscriptionText(text);

            await generateSoapNote(text);
          } catch (err) {
            console.error("Transcription Error:", err);
          } finally {
            setStatus("ready");
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
      } else if (status === "recording") {
        setStatus("processing");
        mediaRecorder?.stop();
      }
    } catch (error) {
      console.error("Mic Permission or Recording Error:", error);
      setStatus("ready");
    }
  };

  const generateSoapNote = async (transcription: string) => {
    try {
      const response = await axios.post("/ai/soap", { transcription });
      setSoapNote({
        subjective: response.data.subjective || "",
        objective: response.data.objective || "",
        assessment: response.data.assessment || "",
        plan: response.data.plan || "",
      });
    } catch (err) {
      console.error("SOAP Generation Error:", err);
    }
  };

  const generatePrescription = async (data: {
    soap_assessment: string;
    patient_info?: Record<string, any>;
  }) => {
    return axios.post("/ai/prescription", data);
  };

  const handleGeneratePrescription = async () => {
    try {
      if (!soapNote.assessment) {
        alert("SOAP note incomplete — cannot generate prescription.");
        return;
      }

      const payload = {
        soap_assessment: soapNote.assessment,
        patient_info: {},
      };

      const response = await generatePrescription(payload);
      const data = response.data;

      // Prefill patient name
      setPatientName(data.patient_info?.name || "Demo Patient");

      // Merge backend medicines
      const backendMeds = data.medications?.length
        ? data.medications.map((m: any, idx: number) => ({
            id: Date.now().toString() + idx,
            name: m.name || "",
            dosage: m.dosage || "",
            frequency: m.frequency || "",
            duration: m.duration || "",
          }))
        : [];

      // Add SOAP plan lines as extra medicines
      const soapMeds: any[] = soapNote.plan
        .split("\n")
        .filter((line) => line.trim())
        .map((line, idx) => ({
          id: "soap-" + idx,
          name: line,
          dosage: "",
          frequency: "",
          duration: "",
        }));

      const mergedMeds = [...backendMeds, ...soapMeds];
      setMedicines(
        mergedMeds.length
          ? mergedMeds
          : [{ id: "1", name: "", dosage: "", frequency: "", duration: "" }]
      );

      // Merge advice
      const mergedAdvice = [data.advice?.join("\n") || "", soapNote.plan || ""]
        .filter(Boolean)
        .join("\n\n");
      setAdvice(mergedAdvice);

      setShowPrescriptionModal(true);
    } catch (err) {
      console.error("Prescription generation failed:", err);
      alert("Failed to generate prescription.");
    }
  };

  const handleClear = () => {
    setTranscriptionText("");
    setSoapNote({ subjective: "", objective: "", assessment: "", plan: "" });
    setStatus("ready");
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: string, value: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;

    printWindow.document.write("<html><head><title>Prescription</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
      .header h2 { color: #3b82f6; margin: 0; font-size: 24px; }
      .header p { color: #666; margin: 4px 0; font-size: 14px; }
      .info { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; }
      .rx { font-size: 48px; color: #3b82f6; margin: 16px 0; }
      .medicine { border-left: 2px solid #3b82f6; padding-left: 16px; margin-bottom: 12px; }
      .medicine p { margin: 4px 0; }
      .advice { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; }
      .footer { border-top: 1px solid #ccc; padding-top: 16px; margin-top: 24px; text-align: right; }
      @media print { body { padding: 0; } }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "recording":
        return (
          <Badge className="status-recording gap-1">
            <Radio className="w-3 h-3" />
            Recording
          </Badge>
        );
      case "processing":
        return <Badge className="status-processing">Processing</Badge>;
      default:
        return <Badge className="status-ready">Ready</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Real-Time Transcription</h1>
          <p className="text-muted-foreground mt-1">Record patient consultation and generate documentation</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Control Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleStartStop}
              className={cn("h-16 px-8 gap-3", status === "recording" && "bg-destructive hover:bg-destructive/90")}
              disabled={status === "processing"}
            >
              {status === "recording" ? (
                <>
                  <MicOff className="w-5 h-5" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" /> Start Recording
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleClear}
              className="h-16 px-8 gap-3"
              disabled={!transcriptionText}
            >
              <Trash2 className="w-5 h-5" /> Clear Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcription Panel */}
        <Card className="lg:h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" /> Live Transcription
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 p-4 bg-muted rounded-lg overflow-auto">
              {transcriptionText ? (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{transcriptionText}</p>
              ) : (
                <p className="text-muted-foreground italic">Click "Start Recording" to begin transcription...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SOAP Note Panel */}
        <Card className="lg:h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> AI Medical Summary (SOAP)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-auto">
            {["subjective", "objective", "assessment", "plan"].map((field) => (
              <div key={field}>
                <Label className="text-sm font-semibold text-foreground block mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
                <Textarea
                  value={(soapNote as any)[field]}
                  onChange={(e) => setSoapNote({ ...soapNote, [field]: e.target.value })}
                  className="min-h-[80px] resize-none"
                  placeholder={`Enter ${field} details...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Button
              variant="outline"
              size="lg"
              disabled={!soapNote.subjective}
              className="gap-2"
              onClick={handleGeneratePrescription}
            >
              <FileText className="w-4 h-4" /> Generate Prescription
            </Button>
            <Button size="lg" disabled={!soapNote.subjective} className="gap-2">
              <Save className="w-4 h-4" /> Save to Patient Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Modal */}
      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Generate Prescription</DialogTitle>
            <DialogDescription>Create and print prescription for the patient</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient">Patient Name</Label>
                <Input id="patient" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Enter patient name" />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={new Date().toISOString().split("T")[0]} readOnly className="bg-muted" />
              </div>
            </div>

            <Separator />

            {/* Medicines Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Medicines</h3>
                <Button variant="outline" size="sm" onClick={addMedicine} className="gap-2"><Plus className="w-4 h-4" /> Add Medicine</Button>
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
                        <TableCell><Input value={medicine.name} onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)} placeholder="e.g., Amoxicillin" className="min-w-[150px]" /></TableCell>
                        <TableCell><Input value={medicine.dosage} onChange={(e) => updateMedicine(medicine.id, "dosage", e.target.value)} placeholder="e.g., 500mg" /></TableCell>
                        <TableCell><Input value={medicine.frequency} onChange={(e) => updateMedicine(medicine.id, "frequency", e.target.value)} placeholder="e.g., Twice daily" /></TableCell>
                        <TableCell><Input value={medicine.duration} onChange={(e) => updateMedicine(medicine.id, "duration", e.target.value)} placeholder="e.g., 7 days" /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeMedicine(medicine.id)} disabled={medicines.length === 1}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
              <Textarea id="advice" value={advice} onChange={(e) => setAdvice(e.target.value)} placeholder="Enter medical advice, dietary instructions, or follow-up recommendations..." className="min-h-[100px]" />
            </div>

            <Separator />

            {/* Print Preview */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Print Preview</h3>
              <div ref={printRef} className="bg-white text-black p-8 rounded-lg border-2 border-border space-y-6">
                {/* Header */}
                <div className="header text-center border-b-2 border-primary pb-4">
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
                <div className="info flex justify-between text-sm">
                  <div><p className="font-semibold">Patient: {patientName}</p></div>
                  <div><p className="font-semibold">Date: {new Date().toLocaleDateString()}</p></div>
                </div>

                {/* Prescription Symbol */}
                <div className="rx text-4xl font-serif text-primary">℞</div>

                {/* Medicines */}
                <div className="space-y-3">
                  {medicines.filter(m => m.name).map((medicine, index) => (
                    <div key={medicine.id} className="medicine border-l-2 border-primary pl-4">
                      <p className="font-semibold">{index + 1}. {medicine.name}</p>
                      <p className="text-sm text-gray-700">Dosage: {medicine.dosage} | {medicine.frequency} | Duration: {medicine.duration}</p>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                {advice && (
                  <div className="advice bg-gray-50 p-4 rounded">
                    <p className="font-semibold mb-2">Medical Advice:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{advice}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="footer pt-4 border-t border-gray-300 text-right">
                  <div className="inline-block">
                    <p className="text-sm font-semibold">Dr. John Smith</p>
                    <p className="text-xs text-gray-600">Signature & Stamp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={handlePrint}><Printer className="w-4 h-4" /> Print Prescription</Button>
              <Button size="lg" className="flex-1 gap-2" onClick={() => setShowPrescriptionModal(false)}><Save className="w-4 h-4" /> Save & Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
