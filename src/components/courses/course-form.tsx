"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { AuthManager } from "@/lib/auth";
import { Course, CourseCreateData } from "@/types";
import { ChangeEvent, useState } from "react";

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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  const courseFormSchema = z.object({
    name: z.string().min(3, t("course_name_min_length")),
    description: z.string().optional(),
    privacy: z.enum(["private", "public"]),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().optional(),
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
    { value: "private", label: t("private_course_desc") },
    { value: "public", label: t("public_course_desc") },
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Optional: Validate file type/size here
    if (!file.type.startsWith("image/")) {
      setError("root", { message: t("invalid_image_type") });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      setError("root", { message: t("image_too_large") });
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>{t("profile_photo")}</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                {/* ... (image preview) ... */}
              </div>
              <div>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("profile-image")?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t("upload_image")}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  {t("max_file_size_image")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("username")} *</Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
                placeholder={t("enter_username")}
                data-testid="course-form-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">{t("first_name")}</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder={t("enter_first_name")}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">{t("last_name")}</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder={t("enter_last_name")}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {t("password")} {!isEditing && "*"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
              placeholder={
                isEditing
                  ? t("leave_blank_for_current_password")
                  : t("enter_password")
              }
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label htmlFor="privacy">{t("privacy")} *</Label>
            <Controller
              name="privacy"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  data-testid="course-form-privacy-select"
                >
                  <SelectTrigger
                    className={errors.privacy ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={t("select_privacy_placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.privacy && (
              <p className="text-sm text-red-500">{errors.privacy.message}</p>
            )}
          </div>

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
