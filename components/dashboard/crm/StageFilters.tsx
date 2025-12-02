"use client";

import { motion } from "framer-motion";

interface StageFiltersProps {
  currentStage: string;
  onStageChange: (stage: string) => void;
  counts: Record<string, number>;
}

const stages = [
  { id: 'all', label: 'Tümü' },
  { id: 'new', label: 'Yeni' },
  { id: 'contacted', label: 'Görüşüldü' },
  { id: 'viewing', label: 'Sunum' },
  { id: 'offer', label: 'Teklif' },
  { id: 'sold', label: 'Satış' },
];

export default function StageFilters({ currentStage, onStageChange, counts }: StageFiltersProps) {
  return (
    <div className="pipeline-tabs custom-scrollbar">
      {stages.map(stage => (
        <button
          key={stage.id}
          onClick={() => onStageChange(stage.id)}
          className={`stage-btn ${currentStage === stage.id ? 'active' : ''}`}
        >
          {stage.label}
          {stage.id !== 'all' && (
            <span className="count-badge">
              {counts[stage.id] || 0}
            </span>
          )}
          {currentStage === stage.id && (
            <motion.div 
              layoutId="activeStage" 
              className="active-line" 
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}