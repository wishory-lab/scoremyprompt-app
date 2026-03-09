'use client';

import { useState } from 'react';

interface ChallengerResultProps {
  challenger: { name: string; score: number; grade: string };
  myScore: number;
  myGrade: string;
}

export default function ChallengerResult({ challenger, myScore, myGrade }: ChallengerResultProps) {
  const [challengeCopied, setChallengeCopied] = useState(false);

  const won = myScore > challenger.score;
  const tied = myScore === challenger.score;

  const handleChallengeBack = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const myName = 'I';
    const text = won
      ? `I beat ${challenger.name}'s PROMPT Score! ${myScore} vs ${challenger.score} \u{1F3C6} Can you beat mine?`
      : `${challenger.name} beat me ${challenger.score} to ${myScore} on ScoreMyPrompt! Can you do better?`;
    const challengeUrl = `${origin}/challenge?score=${myScore}&grade=${myGrade}&name=${encodeURIComponent(myName)}`;
    await navigator.clipboard.writeText(`${text}\n${challengeUrl}`);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
      <p className="text-sm text-gray-300 mb-3">
        {won
          ? `\u{1F3C6} You beat ${challenger.name}'s score! ${myScore} vs ${challenger.score}`
          : tied
          ? `\u{1F91D} Tied with ${challenger.name}! Both scored ${myScore}`
          : `\u{1F624} So close! ${challenger.name} beat you by ${challenger.score - myScore} points`}
      </p>
      <button
        onClick={handleChallengeBack}
        className="btn-primary text-sm"
      >
        {challengeCopied ? 'Copied!' : won ? '\u{1F3C6} Share Your Victory' : '\u{1F525} Challenge Back'}
      </button>
    </div>
  );
}
