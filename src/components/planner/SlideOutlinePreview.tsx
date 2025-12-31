/**
 * SlideOutlinePreview Component
 * 
 * Displays slide deck outlines with slide cards and speaker notes.
 * 
 * Requirements:
 * - 7.1: Display slide-by-slide structure for Direct Instruction phase
 * - 7.4: Show speaker notes for each slide
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Rows3,
  MessageSquare,
  Image,
  Play,
  BookOpen,
  ListChecks,
  Target,
  Lightbulb,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SlideOutline, Slide, SlideType } from '@/lib/instructional/slide-outline';

/**
 * Props for the SlideOutlinePreview component
 */
export interface SlideOutlinePreviewProps {
  /** The slide outline to display */
  slideOutline: SlideOutline;
  /** CSS class name */
  className?: string;
}

/**
 * Slide type configuration
 */
interface SlideTypeConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const SLIDE_TYPE_CONFIG: Record<SlideType, SlideTypeConfig> = {
  title: {
    label: 'Title',
    icon: Presentation,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  agenda: {
    label: 'Agenda',
    icon: ListChecks,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  concept: {
    label: 'Concept',
    icon: Lightbulb,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  example: {
    label: 'Example',
    icon: BookOpen,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  activity: {
    label: 'Activity',
    icon: Play,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  summary: {
    label: 'Summary',
    icon: CheckSquare,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
  },
};

/**
 * SlideTypeBadge Component
 */
function SlideTypeBadge({ type }: { type: SlideType }) {
  const config = SLIDE_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('capitalize', config.color)}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}


/**
 * SlideCard Component
 * Displays a single slide with its content and speaker notes
 * Requirement 7.4: Show speaker notes for each slide
 */
function SlideCard({
  slide,
  isActive,
  onClick,
  showSpeakerNotes,
}: {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
  showSpeakerNotes: boolean;
}) {
  const config = SLIDE_TYPE_CONFIG[slide.type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all overflow-hidden',
        isActive
          ? 'ring-2 ring-examai-purple-500 shadow-lg'
          : 'hover:shadow-md hover:border-examai-purple-500/50'
      )}
      onClick={onClick}
    >
      {/* Slide Preview */}
      <div className={cn('aspect-video relative', config.bgColor)}>
        <div className="absolute inset-0 p-4 flex flex-col">
          {/* Slide Number & Type */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Slide {slide.slideNumber}
            </span>
            <SlideTypeBadge type={slide.type} />
          </div>

          {/* Slide Title */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
            {slide.title}
          </h3>

          {/* Bullet Points Preview */}
          {slide.bulletPoints.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-1 flex-1 overflow-hidden">
              {slide.bulletPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="shrink-0">•</span>
                  <span className="line-clamp-1">{point}</span>
                </li>
              ))}
              {slide.bulletPoints.length > 3 && (
                <li className="text-muted-foreground/60">
                  +{slide.bulletPoints.length - 3} more...
                </li>
              )}
            </ul>
          )}

          {/* Visual Suggestion Indicator */}
          {slide.visualSuggestion && (
            <div className="absolute bottom-2 right-2">
              <Image className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Speaker Notes Preview - Requirement 7.4 */}
      {showSpeakerNotes && (
        <CardContent className="p-3 border-t bg-muted/30">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {slide.speakerNotes}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * SlideDetailPanel Component
 * Shows detailed view of the selected slide
 */
function SlideDetailPanel({ slide }: { slide: Slide }) {
  const config = SLIDE_TYPE_CONFIG[slide.type];
  const Icon = config.icon;

  return (
    <Card className="h-full">
      <CardHeader className={cn('pb-4', config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg border',
              config.bgColor
            )}>
              <Icon className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Slide {slide.slideNumber}
              </p>
              <CardTitle className="text-xl">{slide.title}</CardTitle>
            </div>
          </div>
          <SlideTypeBadge type={slide.type} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bullet Points */}
        {slide.bulletPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Content
            </h4>
            <ul className="space-y-2">
              {slide.bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-examai-purple-500/10 text-examai-purple-500 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visual Suggestion */}
        {slide.visualSuggestion && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Image className="h-4 w-4" />
              Visual Suggestion
            </h4>
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
              {slide.visualSuggestion}
            </p>
          </div>
        )}

        {/* Speaker Notes - Requirement 7.4 */}
        <Accordion type="single" collapsible defaultValue="notes">
          <AccordionItem value="notes" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Speaker Notes
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {slide.speakerNotes}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}


/**
 * SlideOutlinePreview Component
 * 
 * Displays a complete slide outline with navigation and detail view.
 * Requirement 7.1: Display slide-by-slide structure
 */
export function SlideOutlinePreview({
  slideOutline,
  className,
}: SlideOutlinePreviewProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  const selectedSlide = slideOutline.slides[selectedSlideIndex];

  // Count slides by type
  const typeCounts = slideOutline.slides.reduce((acc, slide) => {
    acc[slide.type] = (acc[slide.type] || 0) + 1;
    return acc;
  }, {} as Record<SlideType, number>);

  const handlePrevSlide = () => {
    setSelectedSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setSelectedSlideIndex((prev) =>
      Math.min(slideOutline.slides.length - 1, prev + 1)
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{slideOutline.title}</h2>
          <p className="text-muted-foreground mt-1">
            {slideOutline.slides.length} slides
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Speaker Notes Toggle */}
          <Button
            variant={showSpeakerNotes ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Notes
          </Button>
        </div>
      </div>

      {/* Slide Type Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeCounts).map(([type, count]) => {
          const config = SLIDE_TYPE_CONFIG[type as SlideType];
          return (
            <Badge
              key={type}
              variant="outline"
              className={cn('capitalize', config.color)}
            >
              {config.label}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Slide Thumbnails */}
        <div className="lg:col-span-1">
          <ScrollArea className="h-[600px] pr-4">
            <div className={cn(
              'gap-4',
              viewMode === 'grid' ? 'grid grid-cols-2' : 'space-y-4'
            )}>
              {slideOutline.slides.map((slide, index) => (
                <SlideCard
                  key={slide.slideNumber}
                  slide={slide}
                  isActive={index === selectedSlideIndex}
                  onClick={() => setSelectedSlideIndex(index)}
                  showSpeakerNotes={showSpeakerNotes && viewMode === 'list'}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Slide Detail */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevSlide}
                disabled={selectedSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                {selectedSlideIndex + 1} of {slideOutline.slides.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSlide}
                disabled={selectedSlideIndex === slideOutline.slides.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Detail Panel */}
            {selectedSlide && <SlideDetailPanel slide={selectedSlide} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideOutlinePreview;
