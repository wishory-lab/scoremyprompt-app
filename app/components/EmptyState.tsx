import Link from 'next/link';
import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

function DefaultIcon() {
  return (
    <svg
      className="w-20 h-20 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M12 2v6a1 1 0 001 1h6"
        className="text-gray-700"
      />
    </svg>
  );
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="mb-6">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <div className="mb-6">
          {action.href ? (
            <Link
              href={action.href}
              className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
            >
              {action.label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
      {/* Social Proof */}
      <p className="text-xs text-gray-500 mt-2">
        AI 프롬프트를 분석하고 점수를 확인해 보세요
      </p>
    </div>
  );
}
