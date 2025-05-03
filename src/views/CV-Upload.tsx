import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { toast, Toaster } from "@/app/components/ui/sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { ModeToggle } from "@/app/components/mode-toggle";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address"),
  cv: z
    .instanceof(File)
    .refine((file) => file.size > 0, "CV file is required")
    .refine((file) => file.size < 5000000, "File size should be less than 5MB"),
});

type FormData = z.infer<typeof formSchema>;

export default function CVUpload() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("surname", data.surname);
      formData.append("email", data.email);
      formData.append("cv", data.cv);

      const response = await fetch("/api/cv-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload CV");
      }

      toast.success("Success!", {
        description: "Your CV has been uploaded successfully.",
      });

      form.reset();
      setFileName(null);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to upload CV",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    if (file) {
      setFileName(file.name);
      form.setValue("cv", file);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto bg-card rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-black p-3 rounded-lg">
              <img
                src="/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <ModeToggle />
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center">Apply Here</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          className="bg-background border-input focus:border-primary transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          className="bg-background border-input focus:border-primary transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        className="bg-background border-input focus:border-primary transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cv"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>CV / Resume</FormLabel>
                    <FormControl>
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 
                          ${
                            dragActive
                              ? "border-primary bg-primary/10"
                              : "border-muted bg-muted/50"
                          }
                          hover:border-primary hover:bg-primary/5 cursor-pointer`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileChange(file);
                            }
                          }}
                          {...fieldProps}
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                          {fileName ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                              <p className="text-sm font-medium">{fileName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Click or drag to replace
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">
                                Drag and drop your file here or click to browse
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Accepted formats: PDF, DOC, DOCX (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-6 transition-all duration-200 shadow-lg hover:shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Submit
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
}
