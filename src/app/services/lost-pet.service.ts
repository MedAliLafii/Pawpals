import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface LostPet {
  lostPetID: number;
  clientID: number;
  petName: string;
  breed: string;
  age: number;
  type: string;
  imageURL: string;
  dateLost: string;
  location: string;
  description: string;
  datePosted: string;
  categorieID: number;
}

@Injectable({
  providedIn: 'root'
})
export class LostPetService {

  private lostPets: LostPet[] = [
    {
      lostPetID: 1,
      clientID: 1,
      petName: 'Fluffy',
      breed: 'Golden Retriever',
      age: 5,
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      dateLost: '2024-01-20',
      location: 'Central Park, New York',
      description: 'Fluffy is a friendly Golden Retriever who got lost during our walk in Central Park. He responds to his name and loves treats.',
      datePosted: '2024-01-20',
      categorieID: 1
    },
    {
      lostPetID: 2,
      clientID: 2,
      petName: 'Mittens',
      breed: 'Domestic Shorthair',
      age: 3,
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      dateLost: '2024-01-18',
      location: 'Downtown Los Angeles',
      description: 'Mittens is a black and white cat who escaped from our apartment. She is shy but may come if you call her name.',
      datePosted: '2024-01-18',
      categorieID: 2
    },
    {
      lostPetID: 3,
      clientID: 3,
      petName: 'Buddy',
      breed: 'Labrador Mix',
      age: 2,
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400',
      dateLost: '2024-01-19',
      location: 'Lincoln Park, Chicago',
      description: 'Buddy is a playful Labrador mix who loves to chase balls. He got scared by fireworks and ran away.',
      datePosted: '2024-01-19',
      categorieID: 1
    },
    {
      lostPetID: 4,
      clientID: 4,
      petName: 'Whiskers',
      breed: 'Siamese',
      age: 4,
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
      dateLost: '2024-01-17',
      location: 'South Beach, Miami',
      description: 'Whiskers is a talkative Siamese cat who loves attention. He may approach people for pets.',
      datePosted: '2024-01-17',
      categorieID: 2
    },
    {
      lostPetID: 5,
      clientID: 5,
      petName: 'Daisy',
      breed: 'Beagle',
      age: 1,
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400',
      dateLost: '2024-01-16',
      location: 'Boston Common',
      description: 'Daisy is a curious Beagle who loves to sniff around. She may have followed an interesting scent.',
      datePosted: '2024-01-16',
      categorieID: 1
    },
    {
      lostPetID: 6,
      clientID: 6,
      petName: 'Shadow',
      breed: 'Domestic Shorthair',
      age: 2,
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
      dateLost: '2024-01-15',
      location: 'Pike Place Market, Seattle',
      description: 'Shadow is a sleek black cat who is very independent. He may be hiding in a quiet spot.',
      datePosted: '2024-01-15',
      categorieID: 2
    }
  ];

  constructor() {}

  // Get all lost pets
  getLostPets(): Observable<LostPet[]> {
    return of(this.lostPets);
  }

  // Get lost pet by ID
  getLostPetById(id: number): Observable<LostPet | undefined> {
    const pet = this.lostPets.find(p => p.lostPetID === id);
    return of(pet);
  }

  // Filter lost pets
  filterLostPets(filters: { location?: string; types?: string[]; ages?: number }): Observable<LostPet[]> {
    let filteredPets = [...this.lostPets];

    if (filters.location) {
      filteredPets = filteredPets.filter(pet => pet.location.includes(filters.location!));
    }

    if (filters.types && filters.types.length > 0) {
      filteredPets = filteredPets.filter(pet => filters.types!.includes(pet.type));
    }

    if (filters.ages) {
      filteredPets = filteredPets.filter(pet => pet.age === filters.ages);
    }

    return of(filteredPets);
  }

  // Add new lost pet (for demo purposes)
  addLostPet(pet: Omit<LostPet, 'lostPetID' | 'datePosted'>): Observable<LostPet> {
    const newPet: LostPet = {
      ...pet,
      lostPetID: this.lostPets.length + 1,
      datePosted: new Date().toISOString().split('T')[0]
    };
    this.lostPets.push(newPet);
    return of(newPet);
  }
}
