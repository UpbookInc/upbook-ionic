import { Injectable } from '@angular/core';
import { Profile } from '../model/profile';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { DebugService } from 'src/app/debug/debug.service';
import { NetworkStoreService } from 'src/app/networkStore/networkStore.service';
import { ContactsService } from 'src/app/contacts/contacts.service';

@Injectable({
   providedIn: 'root'
})
export class ProfileService {

   private readonly UB_PROFILE_KEY = 'UB_PROFILE';

   constructor(public storage: Storage, private http: HTTP, private debugService: DebugService, private networkStoreService: NetworkStoreService,
      private contactService: ContactsService) { }

   async sendProfileToNetwork(onSuccess, onFail) {
      this.debugService.add("ProfileService.sendProfileToNetwork: init send profile to network");

      this.http.setDataSerializer('json');
      const profileResponse = await this.getPersonalProfile();

      this.debugService.add("ProfileService.sendProfileToNetwork: got profileResponse");
      if (profileResponse != undefined || profileResponse != null) {

         var convertedProfileToContactFormat = this.convertPersonalProfileToContact(profileResponse);
         var profileToSend: any = {}

         const inNetworkContacts = await this.networkStoreService.getUBDatabaseOfContacts();
         this.debugService.add("ProfileService.sendProfileToNetwork: got inNetworkContacts");

         // make sure the in network contacts have a number
         let contactsWithNumbers = inNetworkContacts.filter(netCont => netCont.phoneNumbers
            && netCont.phoneNumbers[0] && netCont.phoneNumbers[0].value);

         // Currently this sends to ALL numbers, even though we still prompt user select text number
         // TODO: eventually may need to select main or preferred number
         var inNetworkContactNumbers:string[] = []
         contactsWithNumbers.map(contactFromInNetwork => {
            if (contactFromInNetwork.phoneNumbers) {
               contactFromInNetwork.phoneNumbers.map(number => {
                  if (number.value) {
                     inNetworkContactNumbers.push(number.value);
                  }
               });
            } 
         });

         var normalizedInNetworkNumbersFromDevice = this.contactService.normalizePhoneNumberAsStringArray(inNetworkContactNumbers);

         // bake in the '1' prefix if needed
         normalizedInNetworkNumbersFromDevice = normalizedInNetworkNumbersFromDevice.map(inNetworkContact => {
            if (inNetworkContact.length == 10) {
               inNetworkContact = '1' + inNetworkContact;
            }
            return inNetworkContact;
         });

         profileToSend.profile = convertedProfileToContactFormat;
         profileToSend.networkNumbers = normalizedInNetworkNumbersFromDevice;

         this.http.post(this.getApi(),
            profileToSend,
            {})
            .then((data) => {
               this.debugService.add("ProfileService.sendProfileToNetwork: http success");
               onSuccess();
            }, (errorData) => {
               this.debugService.add("ProfileService.sendProfileToNetwork: http error");
               onFail();
            });

      } else {
         onFail("Profile missing");
      }
   }

   getPersonalProfile(): Promise<Profile> {
      this.debugService.add("ProfileService.getPersonalProfile: getting personal profile from storage.")
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   isProfileSavedToUBDatabase(): Promise<Profile> {
      return this.storage.get(this.UB_PROFILE_KEY);
   }

   saveProfileToUBDatabase(profileToSave: Profile) {
      this.debugService.add("ProfileService.saveProfileToUBDatabase: saveProfileToUBDatabase.");
      profileToSave.displayName = profileToSave.firstName + ' ' + profileToSave.lastName
      this.storage.set(this.UB_PROFILE_KEY, profileToSave);
   }

   private convertPersonalProfileToContact(personalProfile): any {
      var profileContact = {
         phoneNumbers: personalProfile.phoneNumbers,
         emails: personalProfile.emails,
         addresses: personalProfile.addresses,
         organizations: personalProfile.organizations,
         displayName: personalProfile.displayName,
         name: {
            familyName: personalProfile.lastName,
            formatted: personalProfile.firstName + ' ' + personalProfile.lastName,
            givenName: personalProfile.firstName
         }
      }
      return profileContact
   }

   isFirstNameSet(profile: Profile): boolean {
      if (!profile.firstName || profile.firstName === '') {
         return false;
      }
      return true;
   }

   isPhoneNumbersSet(profile: Profile): boolean {
      if (!profile.phoneNumbers || profile.phoneNumbers.length < 1 || !profile.phoneNumbers[0].value || profile.phoneNumbers[0].value === '') {
         return false;
      } else {
         return true;
      }
   }

   getApi() {
      return 'https://lwf23x3o1i.execute-api.us-east-1.amazonaws.com/default/UpbookAPISMS-1';
   }
}
