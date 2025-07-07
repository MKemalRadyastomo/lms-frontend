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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor} ring-2 ring-white shadow-sm`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 leading-none">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completion Rate */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center text-gray-900">
              <TrendingUp className="h-5 w-5 mr-3 text-blue-600" />
              Tingkat Penyelesaian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-gray-900">
                {completionRate}%
              </span>
              <Badge 
                variant={completionRate >= 75 ? "default" : completionRate >= 50 ? "secondary" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {completionRate >= 75 ? "Sangat Baik" : 
                 completionRate >= 50 ? "Baik" : "Perlu Ditingkatkan"}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
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
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center text-gray-900">
                <Award className="h-5 w-5 mr-3 text-green-600" />
                Rata-rata Nilai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-gray-900">
                  {averageGrade}
                </span>
                {stats.averageGrade && (
                  <Badge 
                    variant={stats.averageGrade >= 80 ? "default" : 
                            stats.averageGrade >= 70 ? "secondary" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {stats.averageGrade >= 80 ? "Excellent" : 
                     stats.averageGrade >= 70 ? "Good" : "Needs Improvement"}
                  </Badge>
                )}
              </div>
              
              {stats.averageGrade && (
                <div className="space-y-2">
                  {/* Grade Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${stats.averageGrade}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Dari {stats.assignmentsCompleted} tugas yang dinilai
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Summary for Teachers */}
        {userRole === 2 && (
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center text-gray-900">
                <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                Aktivitas Mengajar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600 font-medium">Kursus Aktif</span>
                <span className="font-bold text-lg text-gray-900">
                  {stats.coursesEnrolled}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600 font-medium">Tugas Dibuat</span>
                <span className="font-bold text-lg text-gray-900">
                  {stats.totalSubmissions}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 font-medium">Penilaian Selesai</span>
                <span className="font-bold text-lg text-gray-900">
                  {stats.assignmentsCompleted}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProfileStatsComponent;
