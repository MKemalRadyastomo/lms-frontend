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
import { useStatusColors, getGradeColor, getAssignmentStatusColor } from '@/hooks/useThemeColors';

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
    color: 'bg-primary/10 text-primary border-primary/20',
    iconColor: 'text-primary'
  },
  file_upload: {
    icon: Upload,
    label: 'Upload File',
    color: 'bg-accent/10 text-accent-foreground border-accent/20',
    iconColor: 'text-accent'
  },
  quiz: {
    icon: FileQuestion,
    label: 'Kuis',
    color: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
    iconColor: 'text-secondary-foreground'
  }
} as const;

const statusConfig = {
  not_started: {
    label: 'Belum Dimulai',
    color: 'bg-muted/50 text-muted-foreground border-muted',
    icon: Timer
  },
  draft: {
    label: 'Draf',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20',
    icon: Clock
  },
  submitted: {
    label: 'Dikirim',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: CheckCircle2
  },
  graded: {
    label: 'Dinilai',
    color: 'bg-accent/10 text-accent-foreground border-accent/20',
    icon: GraduationCap
  },
  overdue: {
    label: 'Terlambat',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
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
  const { assignment: assignmentColors } = useStatusColors();
  
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
    if (isOverdue || actualStatus === 'overdue') return 'border-l-destructive shadow-destructive/20';
    if (daysUntilDue <= 1) return 'border-l-amber-500 shadow-amber-500/20';
    if (daysUntilDue <= 3) return 'border-l-yellow-500 shadow-yellow-500/20';
    return 'border-l-primary shadow-primary/20';
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
        "hover:shadow-lg hover:shadow-primary/10",
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
              
              <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {assignment.title}
              </h3>
              
              {showCourseInfo && assignment.course_name && (
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">{assignment.course_name}</span>
                  {assignment.course_code && (
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                      {assignment.course_code}
                    </Badge>
                  )}
                </div>
              )}
              
              {assignment.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {assignment.description}
                </p>
              )}
            </div>
            
            {grade !== undefined && (
              <div className="flex flex-col items-center ml-4">
                <div className={cn(
                  "text-2xl font-bold px-3 py-1 rounded-lg",
                  grade >= 80 ? "text-accent-foreground bg-accent/10" :
                  grade >= 70 ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10" :
                  "text-destructive bg-destructive/10"
                )}>
                  {grade}
                </div>
                <span className="text-xs text-muted-foreground mt-1">dari {assignment.max_score}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <div className="font-medium text-foreground">Batas Waktu</div>
                <div className={cn(
                  "text-sm",
                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  {format(new Date(assignment.due_date), 'dd MMM yyyy, HH:mm', { locale: id })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <div>
                <div className="font-medium text-foreground">Nilai Maksimal</div>
                <div className="text-sm">{assignment.max_score} poin</div>
              </div>
            </div>
          </div>
          
          {/* Time remaining indicator */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
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
                isOverdue ? "text-destructive" :
                daysUntilDue <= 1 ? "text-amber-500" :
                daysUntilDue <= 3 ? "text-yellow-500" :
                "text-muted-foreground"
              )} />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
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
                        : "bg-primary hover:bg-primary/90"
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
