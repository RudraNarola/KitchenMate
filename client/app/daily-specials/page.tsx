"use client";

import { useEffect, useState } from 'react';
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

interface FreshnessCounts {
  Fresh: number;
  Spoiled: number;
  Unknown: number;
}

interface Ingredients {
  [key: string]: FreshnessCounts;
}

interface SpecialDish {
  name: string;
  ingredients: {
    [key: string]: number;
  };
}

interface ServerResponse {
  daily_specials: SpecialDish[];
  ingredients_processed: number;
}

export default function DailySpecials() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredients>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ServerResponse | null>(null);

  useEffect(() => {
    const checkAndSendIngredients = async () => {
      if (typeof window !== 'undefined') {
        const storedIngredients = localStorage.getItem('detectedIngredients');
        if (!storedIngredients) {
       //   alert('Please scan ingredients first before accessing daily specials!');
          router.push('/get_ingredients');
          return;
        }

        try {
          const parsedIngredients = JSON.parse(storedIngredients) as Ingredients;
          setIngredients(parsedIngredients);

          const response = await fetch('http://localhost:8080/daily_specials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: parsedIngredients }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send ingredients to server');
          }

          const data = await response.json();
          setData(data);
          console.log('Server response:', data);
        } catch (error: any) {
          console.error('Error sending ingredients:', error);
          setError(error.message || 'Error processing ingredients. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    checkAndSendIngredients();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar activePage="daily-specials" onPageChange={() => {}} />
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Card */}
          <Card className="bg-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h1 className="text-3xl font-bold text-center text-white">
                Daily Specials
              </h1>
            </div>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Special Dishes Section */}
            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-6 text-center">Today's Special Dishes</h2>
              {loading ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center text-red-400">
                    <p>{error}</p>
                  </CardContent>
                </Card>
              ) : data?.daily_specials?.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center text-gray-400">
                    <p>No special dishes available based on current ingredients.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.daily_specials?.map((dish: SpecialDish, index: number) => (
                    <Card key={index} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-purple-400">
                          <Sparkles className="h-5 w-5" />
                          <span className="capitalize">{dish.name}</span>
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Recommended based on available ingredients
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(dish.ingredients).map(([ingredient, quantity], idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
                              <ChefHat className="h-4 w-4 text-purple-400" />
                              <span className="text-sm">{ingredient}</span>
                              <span className="text-xs text-gray-400">({quantity})</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}