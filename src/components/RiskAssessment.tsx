import React from 'react';
import { motion } from 'motion/react';

export type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  reasons: string[];
  action: string;
}

const rules = [
  { words: ['fire','smoke','sparking','shock','electrical','gas','flood','water leak','security','violence','threat','unsafe'], points: 30, reason: 'Potential safety or infrastructure hazard' },
  { words: ['no water','power cut','electricity','internet down','wifi down','hostel lock','blocked'], points: 18, reason: 'Essential campus service disruption' },
  { words: ['urgent','emergency','danger','immediately','multiple','whole block','entire floor'], points: 16, reason: 'Signals urgency or wider impact' },
  { words: ['slow','broken','damaged','leak','not working','frequent'], points: 8, reason: 'Active service or facility degradation' },
];

export function assessRisk(text: string): RiskAssessment {
  const value = text.toLowerCase();
  let score = 12;
  const reasons: string[] = [];
  for (const rule of rules) {
    if (rule.words.some((word) => value.includes(word))) {
      score += rule.points;
      reasons.push(rule.reason);
    }
  }
  const capped = Math.min(score, 100);
  if (capped >= 70) return { level: 'Critical', score: capped, reasons: reasons.slice(0, 3), action: 'Prioritise for immediate campus response.' };
  if (capped >= 48) return { level: 'High', score: capped, reasons: reasons.slice(0, 3), action: 'Route to the responsible team with elevated priority.' };
  if (capped >= 28) return { level: 'Moderate', score: capped, reasons: reasons.slice(0, 3), action: 'Queue for standard review and resolution.' };
  return { level: 'Low', score: capped, reasons: reasons.length ? reasons.slice(0, 3) : ['No immediate risk indicators detected'], action: 'Continue through the normal service workflow.' };
}

export const RiskAssessmentCard: React.FC<{ text: string; compact?: boolean }> = ({ text, compact }) => {
  const assessment = assessRisk(text);
  const tone = assessment.level === 'Critical' ? 'risk-critical' : assessment.level === 'High' ? 'risk-high' : assessment.level === 'Moderate' ? 'risk-moderate' : 'risk-low';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`risk-card ${tone}`}>
      <div className="risk-card-head">
        <div>
          <div className="risk-eyebrow"><span className="risk-pulse" /> Risk assessment</div>
          <div className="risk-title">{assessment.level} priority</div>
        </div>
        <div className="risk-score">{assessment.score}<span>/100</span></div>
      </div>
      <div className="risk-meter"><motion.div initial={{ width: 0 }} animate={{ width: `${assessment.score}%` }} transition={{ duration: .55 }} /></div>
      {!compact && <><div className="risk-reasons">{assessment.reasons.map((r) => <span key={r}>• {r}</span>)}</div><p className="risk-action">{assessment.action}</p></>}
    </motion.div>
  );
};
