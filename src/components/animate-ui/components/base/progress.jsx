import * as React from 'react';

import {
  Progress as ProgressPrimitive,
  ProgressTrack as ProgressTrackPrimitive,
  ProgressIndicator as ProgressIndicatorPrimitive,
  ProgressLabel as ProgressLabelPrimitive,
  ProgressValue as ProgressValuePrimitive,
} from '@/components/animate-ui/primitives/base/progress';
import { cn } from '@/lib/utils';

function Progress(props) {
  return <ProgressPrimitive {...props} />;
}

function ProgressTrack({
  className,
  ...props
}) {
  return (
    <ProgressTrackPrimitive
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}>
      <ProgressIndicatorPrimitive className="bg-primary rounded-full h-full w-full flex-1" />
    </ProgressTrackPrimitive>
  );
}

function ProgressLabel(props) {
  return <ProgressLabelPrimitive className="text-sm font-medium" {...props} />;
}

function ProgressValue(props) {
  return <ProgressValuePrimitive className="text-sm" {...props} />;
}

export { Progress, ProgressTrack, ProgressLabel, ProgressValue };
