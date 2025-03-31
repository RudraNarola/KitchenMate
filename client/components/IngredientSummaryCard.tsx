import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, PieChart, Carrot } from 'lucide-react';
import { Ingredient } from './IngredientsTable';
import { UploadedImage } from './MultipleImageUploadComponent';

interface IngredientSummaryCardProps {
  image: UploadedImage;
}

const IngredientSummaryCard: React.FC<IngredientSummaryCardProps> = ({ image }) => {
  // If still analyzing or has error, show appropriate placeholder
  if (image.isAnalyzing) {
    return (
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img 
                  src={image.previewUrl} 
                  alt="Food" 
                  className="object-cover w-full h-64"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 flex items-center justify-center">
              <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                <Loader2 className="h-8 w-8 mb-4 text-indigo-500 animate-spin" />
                <p>Analyzing ingredients...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (image.error) {
    return (
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img 
                  src={image.previewUrl} 
                  alt="Food" 
                  className="object-cover w-full h-64"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 flex items-center justify-center">
              <div className="text-center py-8 text-red-400 flex flex-col items-center">
                <AlertCircle className="h-8 w-8 mb-4" />
                <p>Error: {image.error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle different data formats that might come back from API
  const ingredientsData = image.ingredients || {};
  const summary = ingredientsData.summary || {};
  const detectedObjects = ingredientsData.detected_objects || [];
  
  // Get summary statistics - using the same approach as IngredientsTable
  const totalItems = ingredientsData.total_items || 0;
  const totalFresh = ingredientsData.total_fresh || 0;
  const totalSpoiled = ingredientsData.total_spoiled || 0;
  
  const hasIngredients = Object.keys(summary).length > 0 || detectedObjects.length > 0;

  if (!hasIngredients) {
    return (
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img 
                  src={image.previewUrl} 
                  alt="Food" 
                  className="object-cover w-full h-64"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 flex items-center justify-center">
              <div className="text-center py-8 text-gray-400">
                <p>No ingredients detected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image preview */}
          <div className="w-full md:w-1/3">
            <div className="rounded-lg overflow-hidden border border-gray-800">
              <img 
                src={image.previewUrl} 
                alt="Food" 
                className="object-cover w-full h-64"
              />
            </div>
            
            {/* Image stats */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-gray-900/80 rounded-md p-2 text-center border border-gray-700">
                <div className="flex items-center justify-center mb-1">
                  <Carrot className="h-4 w-4 text-indigo-400 mr-1" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <p className="font-semibold text-gray-200">{totalItems}</p>
              </div>
              <div className="bg-gray-900/80 rounded-md p-2 text-center border border-gray-700">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-gray-400">Fresh</span>
                </div>
                <p className="font-semibold text-green-400">{totalFresh}</p>
              </div>
              <div className="bg-gray-900/80 rounded-md p-2 text-center border border-gray-700">
                <div className="flex items-center justify-center mb-1">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-gray-400">Spoiled</span>
                </div>
                <p className="font-semibold text-red-400">{totalSpoiled}</p>
              </div>
            </div>
          </div>
          
          {/* Ingredients list */}
          <div className="w-full md:w-2/3">
            <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center">
              <PieChart className="h-4 w-4 text-indigo-400 mr-2" />
              Ingredient Summary
            </h3>
            
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-gray-800/60 px-4 py-3 border-b border-gray-800">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-xs font-medium text-gray-400 uppercase">Ingredient</div>
                  <div className="text-xs font-medium text-gray-400 uppercase">Quantity</div>
                  <div className="text-xs font-medium text-gray-400 uppercase">Status</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-800">
                {Object.entries(summary).map(([ingredient, status], idx) => {
                  // Skip the meta fields
                  if (['total_fresh', 'total_items', 'total_spoiled'].includes(ingredient)) {
                    return null;
                  }
                  
                  const typedStatus = status as any;
                  const freshCount = typedStatus.Fresh || 0;
                  const spoiledCount = typedStatus.Spoiled || 0;
                  const unknownCount = typedStatus.Unknown || 0;
                  const total = freshCount + spoiledCount + unknownCount;
                  
                  // Determine status based on what's more: fresh or spoiled
                  const isSpoiled = spoiledCount > freshCount;
                  
                  return (
                    <div key={ingredient} className="px-4 py-3 hover:bg-gray-800/40">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm font-medium text-gray-300 capitalize">{ingredient}</div>
                        <div className="text-sm text-gray-400">{total}</div>
                        <div>
                          {isSpoiled ? (
                            <div className="flex items-center">
                              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-900/30 text-red-500">
                                <AlertCircle className="h-3 w-3" />
                              </span>
                              <span className="ml-1.5 text-xs font-medium text-red-400">Spoiled</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-900/30 text-green-500">
                                <CheckCircle className="h-3 w-3" />
                              </span>
                              <span className="ml-1.5 text-xs font-medium text-green-400">Fresh</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar showing fresh vs spoiled ratio */}
                      {total > 0 && (
                        <div className="mt-2">
                          <div className="h-1.5 flex rounded-full overflow-hidden bg-gray-700">
                            {freshCount > 0 && (
                              <div 
                                className="bg-green-500" 
                                style={{ width: `${(freshCount / total) * 100}%` }}
                              ></div>
                            )}
                            {spoiledCount > 0 && (
                              <div 
                                className="bg-red-500" 
                                style={{ width: `${(spoiledCount / total) * 100}%` }}
                              ></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="mt-3 text-right">
              <p className="text-xs text-gray-400">
                Analyzed: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientSummaryCard;