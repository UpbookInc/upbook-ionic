import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   constructor() { }

   getPersonalProfile(): Profile {
      return new Profile("Bruce", "Shaw", "321-123-4567", "bruce@fractalstack.com", "123 Street Rd, Westchester, PA, 15640", "Fractal Stack LLC");
   }
}
