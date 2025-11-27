import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Building, FileText, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [autoGenerateSOAP, setAutoGenerateSOAP] = useState(true);
  const [autoGeneratePrescription, setAutoGeneratePrescription] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your preferences and clinic information</p>
      </div>

      {/* Doctor Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Doctor Details
          </CardTitle>
          <CardDescription>Your professional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">Full Name</Label>
              <Input id="doctorName" defaultValue="Dr. John Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" defaultValue="MBBS, MD - General Medicine" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNo">Registration Number</Label>
              <Input id="registrationNo" defaultValue="MED-123456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" defaultValue="General Medicine" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorEmail">Email</Label>
            <Input id="doctorEmail" type="email" defaultValue="smith@clinic.com" />
          </div>
        </CardContent>
      </Card>

      {/* Clinic Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Clinic Branding
          </CardTitle>
          <CardDescription>Information displayed on prescriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input id="clinicName" defaultValue="City Medical Clinic" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress">Clinic Address</Label>
            <Textarea
              id="clinicAddress"
              defaultValue="123 Healthcare Street, Medical District, City 12345"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicPhone">Phone Number</Label>
              <Input id="clinicPhone" defaultValue="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicEmail">Email</Label>
              <Input id="clinicEmail" type="email" defaultValue="contact@citymedical.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Prescription Template
          </CardTitle>
          <CardDescription>Customize prescription header and footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prescriptionHeader">Header Text</Label>
            <Textarea
              id="prescriptionHeader"
              placeholder="Additional header information..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prescriptionFooter">Footer Text</Label>
            <Textarea
              id="prescriptionFooter"
              defaultValue="This is a computer-generated prescription. Contact the clinic for any clarifications."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            AI Features
          </CardTitle>
          <CardDescription>Configure automatic generation features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSOAP" className="text-base">
                Auto-generate SOAP Notes
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically create structured medical notes from transcription
              </p>
            </div>
            <Switch
              id="autoSOAP"
              checked={autoGenerateSOAP}
              onCheckedChange={setAutoGenerateSOAP}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoPrescription" className="text-base">
                Auto-suggest Prescriptions
              </Label>
              <p className="text-sm text-muted-foreground">
                Suggest medicines based on diagnosis and patient history
              </p>
            </div>
            <Switch
              id="autoPrescription"
              checked={autoGeneratePrescription}
              onCheckedChange={setAutoGeneratePrescription}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
