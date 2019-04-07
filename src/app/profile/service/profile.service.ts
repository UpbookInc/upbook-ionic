import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { DebugService } from 'src/app/debug/debug.service';
import { Contact } from '@ionic-native/contacts/ngx';
import { NetworkStoreService } from 'src/app/networkStore/networkStore.service';
import { ContactsService } from 'src/app/contacts/contacts.service';

// TODO:
// - it would be a nice improvement if this could be pulled from device's contact, just to set the profile for the first time.
// - SUPER LOW Priority: Name change: consider capturing original name incase they performed a name change we can send both as part of update 
//     to also check for the old name.
// Note: return new Profile("Bruce", "Shaw", "321-123-4567", "bruce@fractalstack.com", "123 Street Rd, Westchester, PA, 15640", "Fractal Stack LLC");

const upbookSendMessageApi = 'https://gq3zsrsx63.execute-api.us-east-1.amazonaws.com/default/UpbookSMSApi-1';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   private readonly UB_PROFILE_KEY = 'UB_PROFILE';
   

   constructor(public storage: Storage, private http: HTTP, private debugService: DebugService, private networkStoreService: NetworkStoreService,
      private contactService: ContactsService) { }

   getPersonalProfile(): Promise<Profile> {
      this.debugService.add("ProfileService.getPersonalProfile: getting personal profile from storage.")
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   isProfileSavedToUBDatabase(): Promise<any> {
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   saveProfileToUBDatabase(profileToSave: Profile) {
      this.debugService.add("ProfileService.saveProfileToUBDatabase: saveProfileToUBDatabase.");
      profileToSave.displayName = profileToSave.firstName + ' ' + profileToSave.lastName
      this.storage.set(this.UB_PROFILE_KEY, profileToSave);
   }

   sendProfileToNetwork(onSuccess, onFail) {
      this.debugService.add("ProfileService.sendProfileToNetwork: init send profile to network");

      this.http.setDataSerializer('json');
      this.getPersonalProfile().then(profileResponse => {
         this.debugService.add("ProfileService.sendProfileToNetwork: got profileResponse");
         if (profileResponse != undefined || profileResponse != null) {

            var convertedProfileToContactFormat = this.convertPersonalProfileToContact(profileResponse);
            //console.log(convertedProfileToContactFormat);

            var profileToSend: any = {}

            this.networkStoreService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.debugService.add("ProfileService.sendProfileToNetwork: got deviceContacts");

               this.networkStoreService.getUBSelectedNetworkContacts().then(inNetworkContacts => {
                  this.debugService.add("ProfileService.sendProfileToNetwork: got inNetworkContacts");

                  // get selected network contacts' phoneNumbers from device's contact list 
                  var contactsFromDeviceInNetwork = inNetworkContacts.map(inNetworkContact => {
                     return deviceContacts.find(deviceContact => {
                        return deviceContact.name.givenName === inNetworkContact.name.givenName &&
                           deviceContact.name.familyName === inNetworkContact.name.familyName;
                     });
                  });
                  //console.log(contactsFromDeviceInNetwork);

                  //TODO: eventually may need to select main or preferred number
                  var inNetworkContactNumbers = contactsFromDeviceInNetwork.map(contactFromDeviceinNetwork => {
                     return contactFromDeviceinNetwork.phoneNumbers[0].value;
                  });
                  //console.log(inNetworkContactNumbers);

                  var normalizedInNetworkNumbersFromDevice = this.contactService.normalizePhoneNumberAsStringArray(inNetworkContactNumbers);

                  // bake in the '1' prefix if needed
                  normalizedInNetworkNumbersFromDevice = normalizedInNetworkNumbersFromDevice.map(inNetworkContact => {
                     if (inNetworkContact.length == 10) {
                        inNetworkContact = '1' + inNetworkContact;
                     }
                     return inNetworkContact;
                  });
                  console.log(normalizedInNetworkNumbersFromDevice);

                  profileToSend.profile = convertedProfileToContactFormat;
                  profileToSend.networkNumbers = normalizedInNetworkNumbersFromDevice;
                  // profileToSend.networkNumbers = ['19417163554', '14074317596'];
                  console.log(profileToSend);

                  this.http.post(upbookSendMessageApi,
                     profileToSend,
                     {})
                     .then((data) => {
                        this.debugService.add("ProfileService.sendProfileToNetwork: http success");
                        // console.log(data.status);
                        // console.log(data.data); // data received by server
                        // console.log(data.headers);
                        onSuccess();
                     }, (errorData) => {
                        this.debugService.add("ProfileService.sendProfileToNetwork: http error");
                        // console.log(errorData.status);
                        // console.log(errorData.error); // error message as string
                        // console.log(errorData.headers);
                        onFail();
                     });
               });
            });
         } else {
            onFail("Profile missing");
         }
      });
   }

   //TODO: consider eventually storing profile in Contact format
   private convertPersonalProfileToContact(personalProfile): any {
      var profileContact = {
         phoneNumbers: [{ value: personalProfile.primaryNumber }],
         displayName: personalProfile.displayName,
         emails: [{ value: personalProfile.primaryEmail }],
         address: personalProfile.address,
         name: {
            familyName: personalProfile.firstName,
            formatted: personalProfile.firstName + ' ' + personalProfile.lastName,
            givenName: personalProfile.lastName
         }
      }
      return profileContact
   }

   //testing and experiments ***********************************************************************************

   private convertPersonalProfileToCompressedString(personalProfile): any {
      var profileContact = {
         p: [{ v: personalProfile.primaryNumber }],
         d: personalProfile.firstName + ' ' + personalProfile.lastName,
         e: [{ v: personalProfile.primaryEmail }],
         n: {
            n: personalProfile.firstName,
            f: personalProfile.firstName + ' ' + personalProfile.lastName,
            g: personalProfile.lastName
         }
      }
      return profileContact
   }

   private testGetPhoneNumbers() {
      return {
         phoneNumbers: ['19417163554', '14074317596']
      }
   }

   // NOTE: not used, just a GET test to Lambda incase we need it.
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
