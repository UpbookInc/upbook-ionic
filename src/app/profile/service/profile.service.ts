import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { DebugService } from 'src/app/debug/debug.service';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   private readonly UB_PROFILE_KEY = 'UB_PROFILE';

   constructor(public storage: Storage, private http: HTTP, private debugService: DebugService) { }

   getPersonalProfile(): Promise<Profile> {
      // TODO: originally this should be pulled in from Contacts list
      // - Should allow user to update "Contact Card" with changes to the form
      //return new Profile("Bruce", "Shaw", "321-123-4567", "bruce@fractalstack.com", "123 Street Rd, Westchester, PA, 15640", "Fractal Stack LLC");
      this.debugService.add("ProfileService.getPersonalProfile: getting personal profile from storage.")
      return this.storage.get(this.UB_PROFILE_KEY);
   }


   isProfileSavedToUBDatabase(): Promise<any> {
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   saveProfileToUBDatabase(profileToSave: Profile) {
      this.debugService.add("ProfileService.saveProfileToUBDatabase: saveProfileToUBDatabase.")
      this.storage.set(this.UB_PROFILE_KEY, profileToSave);
   }

   sendProfileToNetwork() {
      console.log("init send profile to network");
      function success(data) {
         console.log("http success");
         console.log(data.status);
         console.log(data.data); // data received by server
         console.log(data.headers);
      }
      function error(errorData) {
         console.log("http error");
         console.log(errorData.status);
         console.log(errorData.error); // error message as string
         console.log(errorData.headers);
      }

      var upbookSendMessageApi = 'https://gq3zsrsx63.execute-api.us-east-1.amazonaws.com/default/UpbookSMSApi-1';
      this.http.setDataSerializer('json');
      this.http.post(upbookSendMessageApi, {
         phoneNumbers: ['19417163554', '14074317596']
      }, {})
      .then(success, error);
   }

   getRequestTest() {
      console.log("init send profile to network");
      function success(data) {
         console.log("http success");
         console.log(data.status);
         console.log(data.data); // data received by server
         console.log(data.headers);
      }
      function error(errorData) {
         console.log("http error");
         console.log(errorData.status);
         console.log(errorData.error); // error message as string
         console.log(errorData.headers);
      }

      var upbookSendMessageApi = 'https://gq3zsrsx63.execute-api.us-east-1.amazonaws.com/default/UpbookSMSApi-1';
      this.http.get(upbookSendMessageApi, {}, {})
      .then(success, error);
   }
}
