import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LineChart, ChefHat, ScanSearch } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon: React.ReactNode;
}

function ActionCard({
  title,
  description,
  href,
  buttonText,
  icon,
}: ActionCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            {icon}
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ActionCard
        title="Demand Analysis"
        description="Analyze ingredient consumption patterns"
        href="/get_demand_analysys"
        buttonText="View Demand Analysis"
        icon={<LineChart className="mr-2 h-4 w-4" />}
      />
      <ActionCard
        title="Menu Optimization"
        description="Optimize your menu with AI recommendations"
        href="/get_optimized_menu"
        buttonText="Optimize Menu"
        icon={<ChefHat className="mr-2 h-4 w-4" />}
      />
      <ActionCard
        title="Ingredient Scanner"
        description="Scan and identify ingredients using AI"
        href="/get_ingredients"
        buttonText="Scan Ingredients"
        icon={<ScanSearch className="mr-2 h-4 w-4" />}
      />
    </div>
  );
}
