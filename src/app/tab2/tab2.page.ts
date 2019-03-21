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
   isNetworkSelectionDisabled: boolean = false;
   MAX_IN_NETWORK_CONTACTS_SELECTED = 2;

   constructor(private networkStoreService: NetworkStoreService, private platform: Platform,
      private profileService: ProfileService, private debugService: DebugService) {
   }

   ionViewDidEnter() {
      this.platform.ready().then((readySource) => {
         this.debugService.add("Tab2Page.ionViewDidEnter: platform ready");
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      this.checkForMaximumSelectedNetworkContacts(contactToToggleForNetwork.inNetwork);
      this.networkStoreService.updateUBContact(contactToToggleForNetwork);
   }

   checkForMaximumSelectedNetworkContacts(isContactSelected) {
      if (isContactSelected === true &&
         this.allContacts.filter(contact => contact.inNetwork).length === this.MAX_IN_NETWORK_CONTACTS_SELECTED) {
         this.isNetworkSelectionDisabled = true;
      } else {
         this.isNetworkSelectionDisabled = false;
      }
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
            this.checkForMaximumSelectedNetworkContacts(true);
         }
      }, errorResults => console.log(errorResults));
   }

   sendProfileToNetwork() {
      this.profileService.sendProfileToNetwork();
   }
}
