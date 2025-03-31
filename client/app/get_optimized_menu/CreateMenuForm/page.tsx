"use client";
import { CreateMenuForm } from "../components/CreateMenuForm";
import { Navbar } from "@/components/navbar";

export default function CreateMenuFormPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200">
      <Navbar activePage="create-menu" onPageChange={() => {}} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Create New Menu
          </h1>
          <p className="text-gray-400 mt-2">
            Select dishes to create your custom menu
          </p>
        </div>
        <CreateMenuForm />
      </div>
    </div>
  );
} 