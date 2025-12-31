/**
 * PPTX Export Utility for Instructional Design Platform
 * Requirements: 7.5, 12.3
 * 
 * Provides PowerPoint export functionality for slide outlines
 * using pptxgenjs library.
 */

import PptxGenJS from 'pptxgenjs';
import type { SlideOutline, Slide, SlideType } from './slide-outline';

// Brand colors (hex format for pptxgenjs)
const COLORS = {
  primary: '6366f1', // Indigo
  secondary: '8b5cf6', // Violet
  accent: 'f59e0b', // Amber
  text: '1f2937', // Gray-800
  textLight: '6b7280', // Gray-500
  background: 'ffffff', // White
  lightBg: 'f3f4f6', // Gray-100
};

// Slide layout configurations by type
const SLIDE_CONFIGS: Record<SlideType, {
  titleColor: string;
  bgColor: string;
  layout: 'title' | 'content' | 'section';
}> = {
  title: { titleColor: COLORS.background, bgColor: COLORS.primary, layout: 'title' },
  agenda: { titleColor: COLORS.text, bgColor: COLORS.background, layout: 'content' },
  concept: { titleColor: COLORS.primary, bgColor: COLORS.background, layout: 'content' },
  example: { titleColor: COLORS.secondary, bgColor: COLORS.background, layout: 'content' },
  activity: { titleColor: COLORS.accent, bgColor: COLORS.lightBg, layout: 'content' },
  summary: { titleColor: COLORS.background, bgColor: COLORS.secondary, layout: 'section' },
};

/**
 * Add a title slide
 */
function addTitleSlide(pptx: PptxGenJS, slide: Slide, presentationTitle: string): void {
  const pptxSlide = pptx.addSlide();
  
  // Background
  pptxSlide.background = { color: COLORS.primary };
  
  // Main title
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: COLORS.background,
    align: 'center',
    fontFace: 'Arial',
  });
  
  // Subtitle (presentation title if different)
  if (presentationTitle !== slide.title) {
    pptxSlide.addText(presentationTitle, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: COLORS.background,
      align: 'center',
      fontFace: 'Arial',
    });
  }
  
  // Brand footer
  pptxSlide.addText('Educasol', {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.3,
    fontSize: 12,
    color: COLORS.background,
    align: 'center',
    fontFace: 'Arial',
  });
  
  // Speaker notes
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }
}

/**
 * Add a content slide (agenda, concept, example)
 */
function addContentSlide(pptx: PptxGenJS, slide: Slide): void {
  const config = SLIDE_CONFIGS[slide.type];
  const pptxSlide = pptx.addSlide();
  
  // Background
  pptxSlide.background = { color: config.bgColor };
  
  // Slide number badge
  pptxSlide.addText(`${slide.slideNumber}`, {
    x: 9,
    y: 0.2,
    w: 0.5,
    h: 0.5,
    fontSize: 14,
    bold: true,
    color: COLORS.background,
    fill: { color: COLORS.primary },
    align: 'center',
    valign: 'middle',
    shape: 'ellipse',
  });
  
  // Title
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: 8.5,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: config.titleColor,
    fontFace: 'Arial',
  });
  
  // Title underline
  pptxSlide.addShape('rect', {
    x: 0.5,
    y: 1.3,
    w: 2,
    h: 0.05,
    fill: { color: COLORS.primary },
  });
  
  // Bullet points
  if (slide.bulletPoints.length > 0) {
    const bulletText = slide.bulletPoints.map(point => ({
      text: point,
      options: {
        bullet: { type: 'bullet' as const, color: COLORS.primary },
        fontSize: 18,
        color: COLORS.text,
        paraSpaceAfter: 10,
      },
    }));
    
    pptxSlide.addText(bulletText, {
      x: 0.5,
      y: 1.6,
      w: 9,
      h: 3.5,
      fontFace: 'Arial',
      valign: 'top',
    });
  }
  
  // Visual suggestion (if present)
  if (slide.visualSuggestion) {
    pptxSlide.addText(`💡 Visual: ${slide.visualSuggestion}`, {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.4,
      fontSize: 12,
      italic: true,
      color: COLORS.textLight,
      fontFace: 'Arial',
    });
  }
  
  // Speaker notes
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }
}

/**
 * Add an activity slide
 */
function addActivitySlide(pptx: PptxGenJS, slide: Slide): void {
  const pptxSlide = pptx.addSlide();
  
  // Light background
  pptxSlide.background = { color: COLORS.lightBg };
  
  // Activity icon/badge
  pptxSlide.addText('🎯 Activity', {
    x: 0.5,
    y: 0.3,
    w: 2,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLORS.background,
    fill: { color: COLORS.accent },
    align: 'center',
    valign: 'middle',
  });
  
  // Title
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.9,
    w: 9,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: COLORS.text,
    fontFace: 'Arial',
  });
  
  // Instructions/bullet points
  if (slide.bulletPoints.length > 0) {
    const bulletText = slide.bulletPoints.map((point, idx) => ({
      text: `${idx + 1}. ${point}`,
      options: {
        fontSize: 18,
        color: COLORS.text,
        paraSpaceAfter: 12,
      },
    }));
    
    pptxSlide.addText(bulletText, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 3.2,
      fontFace: 'Arial',
      valign: 'top',
    });
  }
  
  // Speaker notes
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }
}

/**
 * Add a summary/section slide
 */
function addSummarySlide(pptx: PptxGenJS, slide: Slide): void {
  const pptxSlide = pptx.addSlide();
  
  // Gradient-like background
  pptxSlide.background = { color: COLORS.secondary };
  
  // Title
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 1,
    w: 9,
    h: 1,
    fontSize: 36,
    bold: true,
    color: COLORS.background,
    align: 'center',
    fontFace: 'Arial',
  });
  
  // Key takeaways
  if (slide.bulletPoints.length > 0) {
    const bulletText = slide.bulletPoints.map(point => ({
      text: `✓ ${point}`,
      options: {
        fontSize: 20,
        color: COLORS.background,
        paraSpaceAfter: 15,
      },
    }));
    
    pptxSlide.addText(bulletText, {
      x: 1,
      y: 2.2,
      w: 8,
      h: 3,
      fontFace: 'Arial',
      align: 'center',
      valign: 'top',
    });
  }
  
  // Speaker notes
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes);
  }
}

/**
 * Export a slide outline to PPTX
 * Requirements: 7.5, 12.3
 */
export function exportSlideOutlineToPPTX(slideOutline: SlideOutline): Promise<Blob> {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = 'Educasol';
  pptx.title = slideOutline.title;
  pptx.subject = 'Educational Presentation';
  pptx.company = 'Educasol';
  
  // Set default slide size (16:9)
  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';
  
  // Add slides based on type
  slideOutline.slides.forEach(slide => {
    switch (slide.type) {
      case 'title':
        addTitleSlide(pptx, slide, slideOutline.title);
        break;
      case 'activity':
        addActivitySlide(pptx, slide);
        break;
      case 'summary':
        addSummarySlide(pptx, slide);
        break;
      default:
        addContentSlide(pptx, slide);
        break;
    }
  });
  
  // Generate and return blob
  return pptx.write({ outputType: 'blob' }) as Promise<Blob>;
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download a slide outline as PPTX
 * Requirement 7.5: Generate a downloadable .pptx file
 */
export async function downloadSlideOutlinePPTX(
  slideOutline: SlideOutline,
  filename?: string
): Promise<void> {
  const blob = await exportSlideOutlineToPPTX(slideOutline);
  const name = filename || `slides-${slideOutline.title.replace(/\s+/g, '-').toLowerCase()}.pptx`;
  downloadBlob(blob, name);
}
