import { Component } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { Platform } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { ProfileService } from '../profile/service/profile.service';
import { DebugService } from '../debug/debug.service';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   private userUuid: String;
   allContacts;

   constructor(private networkStoreService: NetworkStoreService, private platform: Platform, private profileService: ProfileService, private debugService: DebugService) {
      //TODO: probably not necessary, but leave for now
      this.debugService.add("Tab2Page.constr: constructor.");
      this.platform.ready().then((readySource) => {
         // Platform now ready, execute any required native code
         this.debugService.add("Tab2Page.constr: platform ready from: " + readySource);
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   getUBContacts() {
      this.debugService.add("Tab2Page.getUBContacts: getUBContacts");
      this.networkStoreService.getUBDatabaseOfContacts(contactsFound => {
         this.allContacts = contactsFound;//this.networkStoreService.parseJsonStringIntoContactsArray(contactsFound);
         //WARNING: THIS COULD GET BIG: console.log(this.allContacts);
         this.debugService.add("Tab2Page.getUBContacts: contacts found.");
      }, errorResults => {
         this.debugService.add("Tab2Page: errorResults");
         this.debugService.add(errorResults);
      });
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      console.log(contactToToggleForNetwork);
      this.networkStoreService.updateUBContact(contactToToggleForNetwork);
   }

   sendProfileToNetwork() {
      this.profileService.sendProfileToNetwork();
   }

   private checkIsUBNetworkDatabaseCreated() {
      this.networkStoreService.getUBDatabaseOfContacts(successResults => {
         if (successResults == null || successResults == undefined) {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB Addressbook to be created.");
            this.networkStoreService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.allContacts = deviceContacts;
               this.networkStoreService.saveContactsToStore(this.allContacts);
            });

         } else {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB addressbook database already exists.");
            this.allContacts = successResults;
         }
      }, errorResults => console.log(errorResults));
   }
}
