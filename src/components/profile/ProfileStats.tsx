"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  Calendar
} from "lucide-react";
import { ProfileStats } from "@/types/profile";

interface ProfileStatsProps {
  stats: ProfileStats;
  userRole: number;
}

export function ProfileStatsComponent({ stats, userRole }: ProfileStatsProps) {
  // Format completion rate
  const completionRate = Math.round(stats.completionRate || 0);
  
  // Format average grade
  const averageGrade = stats.averageGrade ? 
    `${stats.averageGrade.toFixed(1)}/100` : 
    "Belum ada";

  // Get stats based on user role
  const getStatsConfig = () => {
    if (userRole === 2) { // Guru
      return [
        {
          title: "Kursus Diajar",
          value: stats.coursesEnrolled || 0,
          icon: BookOpen,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Tugas Dibuat",
          value: stats.totalSubmissions || 0,
          icon: FileText,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Nilai Diberikan",
          value: stats.assignmentsCompleted || 0,
          icon: Award,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Siswa Aktif",
          value: stats.assignmentsPending || 0,
          icon: TrendingUp,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];
    } else { // Siswa or Admin
      return [
        {
          title: "Kursus Diikuti",
          value: stats.coursesEnrolled || 0,
          icon: BookOpen,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Tugas Selesai",
          value: stats.assignmentsCompleted || 0,
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Tugas Pending",
          value: stats.assignmentsPending || 0,
          icon: Clock,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Total Submisi",
          value: stats.totalSubmissions || 0,
          icon: FileText,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
    }
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Tingkat Penyelesaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {completionRate}%
                </span>
                <Badge 
                  variant={completionRate >= 75 ? "default" : completionRate >= 50 ? "secondary" : "destructive"}
                  className="text-sm"
                >
                  {completionRate >= 75 ? "Sangat Baik" : 
                   completionRate >= 50 ? "Baik" : "Perlu Ditingkatkan"}
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                Dari total {stats.assignmentsCompleted + stats.assignmentsPending} tugas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Grade */}
        {userRole !== 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Rata-rata Nilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">
                    {averageGrade}
                  </span>
                  {stats.averageGrade && (
                    <Badge 
                      variant={stats.averageGrade >= 80 ? "default" : 
                              stats.averageGrade >= 70 ? "secondary" : "destructive"}
                      className="text-sm"
                    >
                      {stats.averageGrade >= 80 ? "Excellent" : 
                       stats.averageGrade >= 70 ? "Good" : "Needs Improvement"}
                    </Badge>
                  )}
                </div>
                
                {stats.averageGrade && (
                  <>
                    {/* Grade Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.averageGrade}%` }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Dari {stats.assignmentsCompleted} tugas yang dinilai
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Summary for Teachers */}
        {userRole === 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Aktivitas Mengajar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kursus Aktif</span>
                  <span className="font-semibold text-gray-900">
                    {stats.coursesEnrolled}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tugas Dibuat</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalSubmissions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Penilaian Selesai</span>
                  <span className="font-semibold text-gray-900">
                    {stats.assignmentsCompleted}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProfileStatsComponent;
