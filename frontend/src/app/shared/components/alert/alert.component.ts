import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export type AlertType = 'success' | 'info' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() autoDismiss: boolean = false;
  @Input() dismissTimeout: number = 5000; // 5 seconds
  @Output() dismissed = new EventEmitter<void>();
  
  visible: boolean = true;

  ngOnInit(): void {
    if (this.autoDismiss) {
      setTimeout(() => this.close(), this.dismissTimeout);
    }
  }

  close(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}
