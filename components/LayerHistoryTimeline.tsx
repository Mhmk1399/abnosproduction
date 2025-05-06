"use client";
import { useState, useEffect } from "react";
import { FiClock, FiArrowRight, FiCheckCircle } from "react-icons/fi";

interface ProcessHistoryItem {
  stepId: {
    _id: string;
    name: string;
    code: string;
  } | string;
  enteredAt: string;
  exitedAt?: string;
  duration?: number;
  notes?: string;
}

interface LayerHistoryTimelineProps {
  processHistory: ProcessHistoryItem[];
}

export default function LayerHistoryTimeline({
  processHistory
}: LayerHistoryTimelineProps) {
  // Format date function - converts to Persian
  const formatDate = (dateString: string) => {
    try {
      // Format to Persian date (Jalali calendar)
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Format duration in a human-readable way
  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return "-";
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ساعت و ${remainingMinutes} دقیقه`;
    }
    
    return `${minutes} دقیقه`;
  };

  // Get step name safely
  const getStepName = (step: any) => {
    if (!step) return "نامشخص";
    if (typeof step === 'object' && step.name) return step.name;
    return "نامشخص";
  };

  // Sort history by entered time
  const sortedHistory = [...processHistory].sort(
    (a, b) => new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime()
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 font-vazir flex items-center gap-2">
        <FiClock className="text-blue-600" />
        تاریخچه مراحل تولید
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gray-200"></div>
        
        {/* Timeline items */}
        <div className="space-y-8">
          {sortedHistory.map((item, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white z-10"></div>
              
              {/* Content */}
              <div className="ml-12 bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 font-vazir">
                    {getStepName(item.stepId)}
                  </h4>
                  <span className="text-sm text-gray-500 font-vazir">
                    {formatDate(item.enteredAt)}
                  </span>
                </div>
                
                {item.exitedAt && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <FiCheckCircle />
                        <span className="text-sm font-vazir">تکمیل شده در {formatDate(item.exitedAt)}</span>
                      </div>
                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded font-vazir">
                        مدت زمان: {formatDuration(item.duration)}
                      </span>
                    </div>
                  </div>
                )}
                
                {!item.exitedAt && index === sortedHistory.length - 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-blue-600">
                      <FiClock />
                      <span className="text-sm font-vazir mr-2">در حال پردازش...</span>
                    </div>
                  </div>
                )}
                
                {item.notes && (
                  <div className="mt-2 text-sm text-gray-600 font-vazir">
                    {item.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
