export type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'declined';

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  styleSelectionType: 'gallery' | 'own_art' | 'own_art_opinion';
  selectedGalleryItemId?: string;
  tatStyle: string; // Style chosen or name of custom request
  placement: string;
  size: string;
  description: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  hasPriorTattoo: boolean;
  skinTone?: string; // Optional if they don't have prior tattoos
  uploadedImage?: string; // Base64 data string
  notes?: string;
  createdAt: string;
}

export interface TattooImage {
  id: string;
  src: string;
  title: string;
  category: 'Fine-Line' | 'Realism' | 'Geometric' | 'Japanese';
  placement: string;
  description: string;
}
