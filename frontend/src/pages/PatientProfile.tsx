import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Mic,
  Pill
} from "lucide-react";
import { mockPatients } from "@/lib/mockData";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = mockPatients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Patient not found</p>
            <Button onClick={() => navigate("/patients")} className="mt-4">
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/patients")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
          <p className="text-muted-foreground">Patient ID: {patient.id}</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => navigate("/transcription")}>
          <Mic className="w-4 h-4" />
          Start New Consultation
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Age</p>
              <p className="text-lg font-semibold">{patient.age} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gender</p>
              <p className="text-lg font-semibold">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </p>
              <p className="text-lg font-semibold">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="text-lg font-semibold break-all">{patient.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Visit History ({patient.visits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {patient.visits.map((visit, index) => (
            <div key={visit.id}>
              {index > 0 && <Separator className="my-6" />}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-sm">
                        {new Date(visit.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </Badge>
                      {visit.prescriptionId && (
                        <Badge className="gap-1">
                          <Pill className="w-3 h-3" />
                          Prescription
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {visit.chiefComplaint}
                    </h3>
                  </div>
                  {visit.prescriptionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/prescription?id=${visit.prescriptionId}`)}
                    >
                      View Prescription
                    </Button>
                  )}
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Subjective</h4>
                    <p className="text-sm text-muted-foreground">{visit.soapNote.subjective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Objective</h4>
                    <p className="text-sm text-muted-foreground">{visit.soapNote.objective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground">{visit.soapNote.assessment}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Plan</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {visit.soapNote.plan}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
