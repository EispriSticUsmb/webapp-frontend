import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  selector: 'popup',
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  @Output() clickOutside = new EventEmitter<void>();

  clickPopUp(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.clickOutside.emit();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    this.clickOutside.emit();
  }
}
