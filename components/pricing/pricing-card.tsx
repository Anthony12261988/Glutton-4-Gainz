import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
  onButtonClick?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  isPopular,
  onButtonClick,
  isLoading
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative flex flex-col h-full border-2",
      isPopular ? "border-tactical-red shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "border-steel/30"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tactical-red text-white text-xs font-bold px-3 py-1 rounded-sm tracking-wider uppercase">
          Recommended
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold uppercase tracking-wider text-white">
          {title}
        </CardTitle>
        <div className="mt-2">
          <span className="text-4xl font-black text-white">{price}</span>
          {price !== "Free" && <span className="text-steel ml-1">/month</span>}
        </div>
        <CardDescription className="text-steel mt-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pt-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-radar-green shrink-0" />
              ) : (
                <X className="h-5 w-5 text-steel/50 shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                feature.included ? "text-gray-200" : "text-steel/50"
              )}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button 
          className={cn(
            "w-full font-bold tracking-wider",
            isPopular ? "bg-tactical-red hover:bg-red-700" : "bg-steel/20 hover:bg-steel/30 text-white"
          )}
          onClick={onButtonClick}
          disabled={isLoading}
        >
          {isLoading ? "PROCESSING..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
