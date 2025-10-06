import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

interface SetupStep {
  title: string;
  description: string;
  isComplete: boolean;
}

interface SetupGuideProps {
  steps: SetupStep[];
}

export function SetupGuide({ steps }: SetupGuideProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-2">Setup Progress</h3>
        <p className="text-sm text-muted-foreground">
          Complete these steps to get your chatbot ready
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              {step.isComplete ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{step.title}</p>
                {step.isComplete && (
                  <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                    Done
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}