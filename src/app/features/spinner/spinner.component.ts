import { Component, Input } from '@angular/core';

@Component({
  selector: 'spinner',
  imports: [],
  templateUrl: 'spinner.component.html',
})
export class SpinnerComponent {
  @Input() w: string = "12vh";
}
