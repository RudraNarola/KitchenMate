"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChefHat, Sparkles } from "lucide-react";

export default function DailySpecials() {
  const router = useRouter();

  useEffect(() => {
    // Check for ingredients in localStorage
    const checkIngredients = () => {
      if (typeof window !== 'undefined') {
        const storedIngredients = localStorage.getItem('detectedIngredients');
        if (!storedIngredients) {
          // If no ingredients found, show alert and redirect
          alert('Please scan ingredients first before accessing daily specials!');
          router.push('/get_ingredients');
        } else {
          // If ingredients found, show success message
          alert('Success! You can now view daily specials based on your available ingredients.');
        }
      }
    };

    checkIngredients();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar activePage="daily-specials" onPageChange={() => {}} />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-center text-white">
              Daily Specials
            </h1>
          </div>

          <div className="p-6">
            {/* Add your daily specials content here */}
            <div className="text-center text-gray-300">
              <p>Your daily specials will be displayed here based on available ingredients.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}