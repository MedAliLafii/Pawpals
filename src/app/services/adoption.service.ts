import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AdoptionPet {
  adoptionPetID: number;
  clientID: number;
  petName: string;
  breed: string;
  age: number;
  gender: string;
  type: string;
  imageURL: string;
  location: string;
  shelter: string;
  description: string;
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  houseTrained: boolean;
  specialNeeds: boolean;
  datePosted: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {

  private adoptionPets: AdoptionPet[] = [
    {
      adoptionPetID: 1,
      clientID: 1,
      petName: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      location: 'New York',
      shelter: 'Happy Paws Shelter',
      description: 'Buddy is a friendly and energetic Golden Retriever who loves to play fetch and go for walks. He is great with children and other dogs.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-15'
    },
    {
      adoptionPetID: 2,
      clientID: 2,
      petName: 'Luna',
      breed: 'Persian',
      age: 2,
      gender: 'Female',
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      location: 'Los Angeles',
      shelter: 'Feline Friends',
      description: 'Luna is a beautiful Persian cat who loves to cuddle and nap in sunny spots. She is calm and gentle, perfect for a quiet home.',
      goodWithKids: true,
      goodWithOtherPets: false,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-10'
    },
    {
      adoptionPetID: 3,
      clientID: 3,
      petName: 'Max',
      breed: 'Labrador Mix',
      age: 1,
      gender: 'Male',
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400',
      location: 'Chicago',
      shelter: 'Second Chance Dogs',
      description: 'Max is a playful and intelligent Labrador mix who loves to learn new tricks. He is very active and would do great in an active family.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-12'
    },
    {
      adoptionPetID: 4,
      clientID: 4,
      petName: 'Whiskers',
      breed: 'Siamese',
      age: 4,
      gender: 'Male',
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
      location: 'Miami',
      shelter: 'Cat Haven',
      description: 'Whiskers is a talkative Siamese cat who loves attention and conversation. He is very social and would love a family that can give him lots of love.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-08'
    },
    {
      adoptionPetID: 5,
      clientID: 5,
      petName: 'Daisy',
      breed: 'Beagle',
      age: 2,
      gender: 'Female',
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400',
      location: 'Boston',
      shelter: 'Beagle Rescue',
      description: 'Daisy is a sweet and curious Beagle who loves to explore and sniff around. She is great with families and loves to go on adventures.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-14'
    },
    {
      adoptionPetID: 6,
      clientID: 6,
      petName: 'Shadow',
      breed: 'Domestic Shorthair',
      age: 3,
      gender: 'Male',
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
      location: 'Seattle',
      shelter: 'Seattle Cat Rescue',
      description: 'Shadow is a sleek black cat who loves to play with toys and chase laser pointers. He is independent but also enjoys cuddling.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-11'
    },
    {
      adoptionPetID: 7,
      clientID: 7,
      petName: 'Rocky',
      breed: 'German Shepherd',
      age: 4,
      gender: 'Male',
      type: 'Dog',
      imageURL: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
      location: 'Denver',
      shelter: 'Mountain Dog Rescue',
      description: 'Rocky is a loyal and protective German Shepherd who would make a great guard dog. He is very intelligent and loves to work.',
      goodWithKids: true,
      goodWithOtherPets: false,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-09'
    },
    {
      adoptionPetID: 8,
      clientID: 8,
      petName: 'Mittens',
      breed: 'Maine Coon',
      age: 2,
      gender: 'Female',
      type: 'Cat',
      imageURL: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
      location: 'Portland',
      shelter: 'Maine Coon Rescue',
      description: 'Mittens is a large and fluffy Maine Coon who loves to be brushed and pampered. She is very gentle and loves to sit in laps.',
      goodWithKids: true,
      goodWithOtherPets: true,
      houseTrained: true,
      specialNeeds: false,
      datePosted: '2024-01-13'
    }
  ];

  constructor() {}

  // Get all adoption pets
  getAdoptionPets(): Observable<AdoptionPet[]> {
    return of(this.adoptionPets);
  }

  // Get adoption pet by ID
  getAdoptionPetById(id: number): Observable<AdoptionPet | undefined> {
    const pet = this.adoptionPets.find(p => p.adoptionPetID === id);
    return of(pet);
  }

  // Filter adoption pets
  filterAdoptionPets(filters: { location?: string; types?: string[]; ages?: number }): Observable<AdoptionPet[]> {
    let filteredPets = [...this.adoptionPets];

    if (filters.location) {
      filteredPets = filteredPets.filter(pet => pet.location === filters.location);
    }

    if (filters.types && filters.types.length > 0) {
      filteredPets = filteredPets.filter(pet => filters.types!.includes(pet.type));
    }

    if (filters.ages) {
      filteredPets = filteredPets.filter(pet => pet.age === filters.ages);
    }

    return of(filteredPets);
  }

  // Add new adoption pet (for demo purposes)
  addAdoptionPet(pet: Omit<AdoptionPet, 'adoptionPetID' | 'datePosted'>): Observable<AdoptionPet> {
    const newPet: AdoptionPet = {
      ...pet,
      adoptionPetID: this.adoptionPets.length + 1,
      datePosted: new Date().toISOString().split('T')[0]
    };
    this.adoptionPets.push(newPet);
    return of(newPet);
  }
}
