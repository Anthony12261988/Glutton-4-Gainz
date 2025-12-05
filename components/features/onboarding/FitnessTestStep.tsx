"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

interface FitnessTestStepProps {
  testNumber: number;
  totalTests: number;
  title: string;
  subtitle: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  isLastStep?: boolean;
}

export function FitnessTestStep({
  testNumber,
  totalTests,
  title,
  subtitle,
  label,
  value,
  onChange,
  onSubmit,
  isLoading = false,
  isLastStep = false,
}: FitnessTestStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-tactical-red">
          TEST {testNumber} OF {totalTests}
        </h1>
        <p className="mt-1 text-sm text-muted-text">{subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Enter the total {label.toLowerCase()} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="test-input"
                className="text-xs font-bold uppercase tracking-wide text-muted-text"
              >
                {label}
              </label>
              <Input
                id="test-input"
                type="number"
                min="0"
                max="500"
                placeholder="0"
                value={value || ""}
                onChange={(e) => onChange(Number(e.target.value))}
                className="text-2xl font-bold"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "PROCESSING..." : isLastStep ? "COMPLETE TEST" : "NEXT TEST"}
              {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
