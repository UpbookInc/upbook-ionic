import { Component } from '@angular/core';
import { AddressbookService } from '../addressbook/addressbook.service';
import { Platform } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { ProfileService } from '../profile/service/profile.service';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   private userUuid: String;
   private allContacts;

   constructor(private addressbookService: AddressbookService, private platform: Platform, private profileService: ProfileService) {
      //TODO: probably not necessary, but leave for now
      this.platform.ready().then((readySource) => {
         // Platform now ready, execute any required native code
         console.log('Platform ready from', readySource);
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   getUBContacts() {
      this.addressbookService.getUBDatabaseOfContacts().then(
         (contactsFound) => {
            this.allContacts = JSON.parse(contactsFound);
            console.log(this.allContacts);
         }
      );
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      console.log(contactToToggleForNetwork);
      this.addressbookService.updateUBContact(contactToToggleForNetwork);
   }

   sendProfileToNetwork() {
      this.profileService.sendProfileToNetwork();
   }

   private checkIsUBNetworkDatabaseCreated() {
      this.addressbookService.getUBDatabaseOfContacts().then(result => {
         if (result == null || result == undefined) {
            console.log("UB Addressbook to be created");
            this.addressbookService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.allContacts = deviceContacts;
               this.addressbookService.saveContactsToStore(this.allContacts);
            });
            
         } else {
            console.log("UB addressbook database already exists");
            this.allContacts = JSON.parse(result);
         }
      });
   }
}
