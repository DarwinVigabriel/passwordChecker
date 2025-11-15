'use client';;
import * as React from 'react';
import { Progress as ProgressPrimitives } from '@base-ui-components/react/progress';
import { motion } from 'motion/react';

import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number';
import { getStrictContext } from '@/lib/get-strict-context';

const [ProgressProvider, useProgress] =
  getStrictContext('ProgressContext');

const Progress = (props) => {
  return (
    <ProgressProvider value={{ value: props.value ?? 0 }}>
      <ProgressPrimitives.Root data-slot="progress" {...props} />
    </ProgressProvider>
  );
};

const MotionProgressIndicator = motion.create(ProgressPrimitives.Indicator);

function ProgressIndicator({
  transition = { type: 'spring', stiffness: 100, damping: 30 },
  ...props
}) {
  const { value } = useProgress();

  return (
    <MotionProgressIndicator
      data-slot="progress-indicator"
      animate={{ width: `${value}%` }}
      transition={transition}
      {...props} />
  );
}

function ProgressTrack(props) {
  return <ProgressPrimitives.Track data-slot="progress-track" {...props} />;
}

function ProgressLabel(props) {
  return <ProgressPrimitives.Label data-slot="progress-label" {...props} />;
}

function ProgressValue({
  transition = { stiffness: 80, damping: 20 },
  ...props
}) {
  const { value } = useProgress();

  return (
    <ProgressPrimitives.Value
      data-slot="progress-value"
      render={
        <CountingNumber number={value ?? 0} transition={transition} {...props} />
      } />
  );
}

export { Progress, ProgressIndicator, ProgressTrack, ProgressLabel, ProgressValue, useProgress };
