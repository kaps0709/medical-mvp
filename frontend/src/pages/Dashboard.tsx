import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  FileText,
  TrendingUp,
  Mic,
  UserPlus,
  Settings,
  Activity
} from "lucide-react";
import { dashboardStats } from "@/lib/mockData";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Patients Today",
      value: dashboardStats.patientsToday,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Avg Consultation Time",
      value: dashboardStats.avgConsultationTime,
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Prescriptions Generated",
      value: dashboardStats.prescriptionsGenerated,
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Total Patients",
      value: dashboardStats.totalPatients,
      icon: TrendingUp,
      color: "text-accent-foreground",
      bgColor: "bg-accent"
    }
  ];

  const quickActions = [
    {
      title: "Start Transcription",
      description: "Begin new patient consultation",
      icon: Mic,
      onClick: () => navigate("/transcription"),
      variant: "default" as const
    },
    {
      title: "View Patients",
      description: "Access patient records",
      icon: Users,
      onClick: () => navigate("/patients"),
      variant: "outline" as const
    },
    {
      title: "New Patient",
      description: "Register new patient",
      icon: UserPlus,
      onClick: () => navigate("/patients"),
      variant: "outline" as const
    },
    {
      title: "Settings",
      description: "Configure preferences",
      icon: Settings,
      onClick: () => navigate("/settings"),
      variant: "outline" as const
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Dr. Smith</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.onClick}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { patient: "Emily Davis", action: "Prescription generated", time: "10 mins ago" },
              { patient: "Sarah Johnson", action: "Consultation completed", time: "45 mins ago" },
              { patient: "John Smith", action: "Follow-up scheduled", time: "2 hours ago" },
              { patient: "Michael Brown", action: "Lab results reviewed", time: "3 hours ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-foreground">{activity.patient}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
