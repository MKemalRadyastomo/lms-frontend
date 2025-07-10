'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  variant?: 'default' | 'hero' | 'simple';
  className?: string;
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

export function PageWrapper({
  children,
  title,
  description,
  icon: Icon,
  iconColor = 'blue',
  badge,
  badgeVariant = 'secondary',
  variant = 'default',
  className,
  headerContent,
  actions
}: PageWrapperProps) {
  const renderHeader = () => {
    if (variant === 'hero') {
      return (
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <div className="flex items-start gap-4 mb-6">
                {Icon && (
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <Icon className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {badge && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold mb-3">{title}</h1>
                  {description && (
                    <p className="text-xl text-blue-100 mb-4 leading-relaxed">
                      {description}
                    </p>
                  )}
                  {headerContent}
                </div>
                {actions && (
                  <div className="flex items-start gap-2">
                    {actions}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    if (variant === 'simple') {
      return (
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    // Default variant
    return (
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  iconColorClasses[iconColor]
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {badge && (
                    <Badge variant={badgeVariant}>
                      {badge}
                    </Badge>
                  )}
                </div>
                {description && (
                  <p className="text-gray-600">{description}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
          {headerContent}
        </motion.div>
      </div>
    );
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {renderHeader()}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}