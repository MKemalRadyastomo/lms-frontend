"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/ui/form-select";
import { apiClient } from "@/lib/api";
import { AuthManager } from "@/lib/auth";
import { Course, CourseCreateData } from "@/types";

interface CourseFormProps {
  course?: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = !!course;
  const currentUser = AuthManager.getUserData();

  const courseFormSchema = z.object({
    name: z.string().min(3, "Course name must be at least 3 characters"),
    description: z.string().optional(),
    privacy: z.enum(["private", "public"]),
  });

  type CourseFormData = z.infer<typeof courseFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course
      ? {
          name: course.name,
          description: course.description || "",
          privacy: course.privacy,
        }
      : {
          privacy: "private", // Default to private
        },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      const courseData: CourseCreateData = {
        name: data.name,
        description: data.description,
        privacy: data.privacy,
        teacher_id: currentUser!.id,
      };
      return apiClient.createCourse(courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t("failed_to_create_course");
      setError("root", { message });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      if (!course) throw new Error("Course not found");

      const courseData: Partial<CourseCreateData> = {
        name: data.name,
        description: data.description,
        privacy: data.privacy,
      };

      return apiClient.updateCourse(course.id, courseData);
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", updatedCourse.id] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t("failed_to_update_course");
      setError("root", { message });
    },
  });

  const privacyOptions = [
    { value: "private", label: "Private - Only enrolled students can access" },
    { value: "public", label: "Public - Anyone can discover and enroll" },
  ];

  const onSubmit = (data: CourseFormData) => {
    if (isEditing) {
      updateCourseMutation.mutate(data);
    } else {
      createCourseMutation.mutate(data);
    }
  };

  const isLoading =
    createCourseMutation.isPending || updateCourseMutation.isPending;

  // Check if user has permission to create/edit courses
  if (!AuthManager.hasRole("admin") && !AuthManager.hasRole("guru")) {
    return (
      <Card
        className="w-full max-w-2xl"
        data-testid="course-form-access-denied"
      >
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("access_denied")}
          </h3>
          <p className="text-gray-600 mb-4">{t("access_denied_message")}</p>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              data-testid="course-form-cancel-button"
            >
              {t("cancel")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl" data-testid="course-form">
      <CardHeader>
        <CardTitle>
          {isEditing ? t("edit_course") : t("create_new_course")}
        </CardTitle>
        <CardDescription>
          {isEditing ? t("update_course_info") : t("create_new_course_info")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Enter course name"
              data-testid="course-form-name-input"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Course Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Enter course description (optional)"
            />
          </div>

          {/* Privacy */}
          <FormSelect
            name="privacy"
            control={control}
            label="Course Visibility *"
            placeholder="Select course visibility"
            options={privacyOptions}
            triggerClassName="data-[testid='course-form-privacy-select']"
          />

          {/* Error Display */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                data-testid="course-form-cancel-button"
              >
                {t("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="course-form-submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? t("updating") : t("creating")}
                </>
              ) : isEditing ? (
                t("update_course")
              ) : (
                t("create_course")
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
