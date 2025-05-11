/**
 * Text Component
 *
 * Purpose: Provides advanced text handling beyond simple styling
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import { TextStyle, TextStyleOptions } from '../styles/textStyle';

export interface TextComponentOptions {
  text: string | string[];
  style?: TextStyleOptions;
  maxWidth?: number;
  maxLines?: number;
  ellipsis?: string;
  wordWrap?: boolean;
  hyphenation?: boolean;
  lineHeight?: number;
  paragraphSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  rotation?: number;
  interactive?: boolean;
  selectable?: boolean;
  highlightable?: boolean;
  linkify?: boolean;
  onTextClick?: (text: string, index: number) => void;
}

export class TextComponent {
  text: string | string[];
  style: TextStyle;
  maxWidth: number;
  maxLines: number;
  ellipsis: string;
  wordWrap: boolean;
  hyphenation: boolean;
  lineHeight: number;
  paragraphSpacing: number;
  textAlign: string;
  verticalAlign: string;
  rotation: number;
  interactive: boolean;
  selectable: boolean;
  highlightable: boolean;
  linkify: boolean;
  onTextClick: ((text: string, index: number) => void) | null;

  constructor(options: TextComponentOptions) {
    this.text = options.text;
    this.style = new TextStyle(options.style || {});
    this.maxWidth = options.maxWidth || 0;
    this.maxLines = options.maxLines || 0;
    this.ellipsis = options.ellipsis || '...';
    this.wordWrap = options.wordWrap !== undefined ? options.wordWrap : true;
    this.hyphenation = options.hyphenation || false;
    this.lineHeight = options.lineHeight || 1.2;
    this.paragraphSpacing = options.parag
