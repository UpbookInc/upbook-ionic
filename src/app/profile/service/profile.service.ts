import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms/ngx';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   private readonly UB_PROFILE_KEY = 'UB_PROFILE';

   constructor(public storage: Storage, private sms: SMS) { }

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
      console.log("init send profile to network");
      function success(status) {
         console.log("SMS success");
         console.log(status);
      }
      function error(errorStatus) {
         console.log("SMS error");
         console.log(errorStatus);
      }
      var options = {
         replaceLineBreaks: false, // true to replace \n by a new line, false by default
         android: {
            //intent: 'INTENT'  // send SMS with the native android SMS messaging
            intent: '' // send SMS without opening any other app
         }
      };
      this.sms.send('9417163554', 'Please join my UpBook network!', options).then(success, error);
      //TODO: get UB network
      //TODO: send text to everyone in network
   }
}
