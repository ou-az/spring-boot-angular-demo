import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = 'yellow';
  @Input() defaultColor: string = '';
  
  private originalBackgroundColor: string = '';

  constructor(private el: ElementRef) {
    this.originalBackgroundColor = this.el.nativeElement.style.backgroundColor || '';
  }

  ngOnInit() {
    this.defaultColor = this.defaultColor || this.originalBackgroundColor;
    this.el.nativeElement.style.transition = 'background-color 0.3s';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || 'yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
