import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventCardComponent } from '../../event/event-card/event-card.component';
import { EventService } from '../../../core/event/event.service';
import { Event } from '../../event/event/event.model';

@Component({
  selector: 'app-event-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventCardComponent],
  templateUrl: './event-creation-component.html'
})
export class EventCreationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventService = inject(EventService);

  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  eventForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    descriptionSummary: ['', [Validators.maxLength(255)]],
    description: ['', [Validators.required]],
    location: [''],
    externalLink: [''],
    startDate: [null],
    endDate: [null],
    registrationStart: [null],
    registrationEnd: [null],
    maxParticipants: [null],
    allowTeams: [false],
    maxTeamSize: [null]
  });

  constructor() {
    this.eventForm.get('allowTeams')?.valueChanges.subscribe((allow) => {
      const sizeControl = this.eventForm.get('maxTeamSize');
      if (allow) {
        sizeControl?.setValidators([Validators.required, Validators.min(2)]);
      } else {
        sizeControl?.clearValidators();
        sizeControl?.setValue(null);
      }
      sizeControl?.updateValueAndValidity();
    });
  }

  get f() { return this.eventForm.controls; }

  get previewEvent(): Event {
    return {
        id: '', 
        ...this.eventForm.value,
        createdAt: new Date(),
        updatedAt: new Date()
    } as Event;
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set("L'image est trop lourde (Max 10Mo)");
        return;
      }
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.eventForm.value;

    this.eventService.createEvent(formValue).subscribe({
      next: (newEvent: Event) => {
        if (this.selectedFile && newEvent.id) {
          this.eventService.putEventImg(newEvent.id, this.selectedFile).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.router.navigate(['/event',newEvent.id]);
            },
            error: () => {
                this.isSubmitting.set(false);
                this.router.navigate(['/event',newEvent.id]); 
            }
          });
        } else {
          this.isSubmitting.set(false);
          this.router.navigate(['/event',newEvent.id]);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set("Erreur lors de la création de l'événement.");
      }
    });
  }
}