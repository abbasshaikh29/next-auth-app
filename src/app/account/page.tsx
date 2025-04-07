"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "@/components/FileUpload";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2 } from "lucide-react";
import { useNotification } from "@/components/Notification";
import { apiClient } from "@/lib/api-client";

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const handleUploadSuccess = (response: IKUploadResponse) => {
    setValue("imageUrl", response.filePath);
    showNotification("Image uploaded successfully!", "success");
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      await apiClient.createimage(data);
      showNotification("Product created successfully!", "success");

      // Reset form after successful submission
      setValue("name", "");
      setValue("description", "");
      setValue("imageUrl", "");
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to create product",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="w-1/2 flex flex-col gap-5 p-5">
        <h1 className="text-2xl font-bold">update community </h1>
        <div className="form-control">
          <label className="label">Product Name</label>
          <input
            type="text"
            className={`input input-bordered ${
              errors.name ? "input-error" : ""
            }`}
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <span className="text-error text-sm mt-1">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">Description</label>
          <textarea
            className={`textarea textarea-bordered h-24 ${
              errors.description ? "textarea-error" : ""
            }`}
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <span className="text-error text-sm mt-1">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">Product Image</label>
          <FileUpload onSuccess={handleUploadSuccess} />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Product...
            </>
          ) : (
            "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}
