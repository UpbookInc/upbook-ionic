import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';
import { Storage } from '@ionic/storage';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   private readonly UB_PROFILE_KEY = 'UB_PROFILE';

   constructor(public storage: Storage) { }

   getPersonalProfile(): Promise<Profile> {
      // TODO: originally this should be pulled in from Contacts list
      // - Should allow user to update "Contact Card" with changes to the form
      //return new Profile("Bruce", "Shaw", "321-123-4567", "bruce@fractalstack.com", "123 Street Rd, Westchester, PA, 15640", "Fractal Stack LLC");
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   
   isProfileSavedToUBDatabase(): Promise<any> {
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   saveProfileToUBDatabase(profileToSave: Profile) {
      this.storage.set(this.UB_PROFILE_KEY, profileToSave);
   }

   sendProfileToNetwork() {
      //TODO: get UB network
      //TODO: send text to everyone in network
   }
}
