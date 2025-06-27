'use client'

import React from 'react';
import Link from 'next/link';
import { Assignment } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  BookOpen, 
  Upload, 
  FileQuestion,
  Clock,
  Calendar,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment & {
    course_name?: string;
    course_code?: string;
  };
  userRole: 'student' | 'teacher' | 'admin';
  submissionStatus?: 'not_started' | 'draft' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  showCourseInfo?: boolean;
}

const typeConfig = {
  essay: {
    icon: BookOpen,
    label: 'Esai',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600'
  },
  file_upload: {
    icon: Upload,
    label: 'Upload File',
    color: 'bg-green-500/10 text-green-700 border-green-200',
    iconColor: 'text-green-600'
  },
  quiz: {
    icon: FileQuestion,
    label: 'Kuis',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    iconColor: 'text-purple-600'
  }
} as const;

const statusConfig = {
  not_started: {
    label: 'Belum Dimulai',
    color: 'bg-gray-500/10 text-gray-700 border-gray-200',
    icon: Timer
  },
  draft: {
    label: 'Draf',
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    icon: Clock
  },
  submitted: {
    label: 'Dikirim',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    icon: CheckCircle2
  },
  graded: {
    label: 'Dinilai',
    color: 'bg-green-500/10 text-green-700 border-green-200',
    icon: GraduationCap
  },
  overdue: {
    label: 'Terlambat',
    color: 'bg-red-500/10 text-red-700 border-red-200',
    icon: AlertTriangle
  }
} as const;

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ 
  assignment, 
  userRole, 
  submissionStatus = 'not_started',
  grade,
  showCourseInfo = false
}) => {
  const typeInfo = typeConfig[assignment.type as keyof typeof typeConfig];
  const statusInfo = statusConfig[submissionStatus];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;
  
  const isOverdue = new Date(assignment.due_date) < new Date() && submissionStatus !== 'submitted' && submissionStatus !== 'graded';
  const daysUntilDue = Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const actualStatus = isOverdue ? 'overdue' : submissionStatus;
  const actualStatusInfo = isOverdue ? statusConfig.overdue : statusInfo;
  const ActualStatusIcon = actualStatusInfo.icon;

  const getUrgencyColor = () => {
    if (isOverdue || actualStatus === 'overdue') return 'border-l-red-500 shadow-red-100';
    if (daysUntilDue <= 1) return 'border-l-orange-500 shadow-orange-100';
    if (daysUntilDue <= 3) return 'border-l-yellow-500 shadow-yellow-100';
    return 'border-l-blue-500 shadow-blue-100';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <Card className={cn(
        "relative border-l-4 transition-all duration-300 cursor-pointer",
        "hover:shadow-lg hover:shadow-blue-100/50",
        getUrgencyColor()
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  typeInfo.color
                )}>
                  <TypeIcon className={cn("h-4 w-4", typeInfo.iconColor)} />
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-medium", typeInfo.color)}
                >
                  {typeInfo.label}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-medium", actualStatusInfo.color)}
                >
                  <ActualStatusIcon className="h-3 w-3 mr-1" />
                  {actualStatusInfo.label}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                {assignment.title}
              </h3>
              
              {showCourseInfo && assignment.course_name && (
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-3 w-3 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">{assignment.course_name}</span>
                  {assignment.course_code && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      {assignment.course_code}
                    </Badge>
                  )}
                </div>
              )}
              
              {assignment.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {assignment.description}
                </p>
              )}
            </div>
            
            {grade !== undefined && (
              <div className="flex flex-col items-center ml-4">
                <div className={cn(
                  "text-2xl font-bold px-3 py-1 rounded-lg",
                  grade >= 80 ? "text-green-700 bg-green-50" :
                  grade >= 70 ? "text-yellow-700 bg-yellow-50" :
                  "text-red-700 bg-red-50"
                )}>
                  {grade}
                </div>
                <span className="text-xs text-gray-500 mt-1">dari {assignment.max_score}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <div className="font-medium text-gray-900">Batas Waktu</div>
                <div className={cn(
                  "text-sm",
                  isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                )}>
                  {format(new Date(assignment.due_date), 'dd MMM yyyy, HH:mm', { locale: id })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="h-4 w-4" />
              <div>
                <div className="font-medium text-gray-900">Nilai Maksimal</div>
                <div className="text-sm">{assignment.max_score} poin</div>
              </div>
            </div>
          </div>
          
          {/* Time remaining indicator */}
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isOverdue 
                  ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                  : daysUntilDue === 0 
                    ? 'Batas waktu hari ini'
                    : daysUntilDue === 1
                      ? 'Besok batas waktu'
                      : `${daysUntilDue} hari lagi`
                }
              </span>
              <Clock className={cn(
                "h-4 w-4",
                isOverdue ? "text-red-500" :
                daysUntilDue <= 1 ? "text-orange-500" :
                daysUntilDue <= 3 ? "text-yellow-500" :
                "text-gray-400"
              )} />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              Dibuat {format(new Date(assignment.created_at), 'dd MMM yyyy', { locale: id })}
            </div>
            
            <div className="flex gap-2">
              {userRole === 'teacher' || userRole === 'admin' ? (
                <>
                  <Link href={`/courses/${assignment.course_id}/assignments/${assignment.id}/analytics`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Analitik
                    </Button>
                  </Link>
                  <Link href={`/courses/${assignment.course_id}/assignments/${assignment.id}`}>
                    <Button size="sm" className="text-xs">
                      Kelola
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/assignments/${assignment.id}`}>
                  <Button 
                    size="sm" 
                    className={cn(
                      "text-xs font-medium",
                      actualStatus === 'submitted' || actualStatus === 'graded' 
                        ? "" 
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                    variant={actualStatus === 'submitted' || actualStatus === 'graded' ? "outline" : "default"}
                  >
                    {actualStatus === 'graded' ? 'Lihat Nilai' :
                     actualStatus === 'submitted' ? 'Lihat Pengiriman' :
                     actualStatus === 'draft' ? 'Lanjutkan' :
                     'Mulai Tugas'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
