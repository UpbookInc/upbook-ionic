import { Component } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { Platform, ToastController } from '@ionic/angular';
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
   searching: any = false;
   searchTerm: string = '';
   allContacts;
   filteredContacts;
   isNetworkSelectionDisabled: boolean = false;
   MAX_IN_NETWORK_CONTACTS_SELECTED = 4;
   selectedNetworkSize: any;
   sending: boolean;

   constructor(private networkStoreService: NetworkStoreService, private platform: Platform,
      private profileService: ProfileService, private debugService: DebugService, public toastController: ToastController) {
   }

   setFilteredItems(reset) {
      this.searching = true;
      if (reset === true) {
         this.searchTerm = '';
      }
      this.filteredContacts = this.allContacts.filter((item) => {
         if (item.name && item.name.formatted) {
            return item.name.formatted.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
         } else {
            // prevents any "missing name" contacts from staying hidden after search term is cleared
            if (this.searchTerm == '') {
               return true;
            } else {
               return false;
            }
         }
      });
      this.searching = false;
   }

   ionViewDidEnter() {
      this.platform.ready().then((readySource) => {
         this.debugService.add("Tab2Page.ionViewDidEnter: platform ready");
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      this.checkForMaximumSelectedNetworkContacts(contactToToggleForNetwork.inNetwork);
      this.networkStoreService.updateMultipleUBContacts([contactToToggleForNetwork]);
   }

   checkForMaximumSelectedNetworkContacts(isContactSelected) {
      this.selectedNetworkSize = this.getSelectedNetworkSize();
      if (isContactSelected === true &&
         this.selectedNetworkSize === this.MAX_IN_NETWORK_CONTACTS_SELECTED) {
         this.isNetworkSelectionDisabled = true;
      } else {
         this.isNetworkSelectionDisabled = false;
      }
   }

   clearNetworkSelections() {
      let contactsToUpdate: Array<Contact> = [];
      this.allContacts.map(contact => {
         if (contact.inNetwork === true) {
            contact.inNetwork = false;
            contactsToUpdate.push(contact)
         }
      });
      this.networkStoreService.updateMultipleUBContacts(contactsToUpdate);
      this.selectedNetworkSize = this.getSelectedNetworkSize();
      this.checkForMaximumSelectedNetworkContacts(true);
   }

   getSelectedNetworkSize() {
      return this.allContacts.filter(contact => contact.inNetwork).length;
   }

   private checkIsUBNetworkDatabaseCreated() {
      this.networkStoreService.getUBDatabaseOfContacts(successResults => {
         if (successResults == null || successResults == undefined) {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB Addressbook to be created.");
            this.networkStoreService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.allContacts = this.sortData(deviceContacts);
               this.filteredContacts = this.sortData(deviceContacts);
               this.networkStoreService.saveContactsToStore(this.allContacts);
            });

         } else {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB addressbook database already exists.");
            this.allContacts = this.sortData(successResults);
            this.filteredContacts = this.sortData(successResults);
            this.checkForMaximumSelectedNetworkContacts(true);
         }
      }, errorResults => console.log(errorResults));
   }

   sortData(array: Array<Contact>): Array<Contact> {
      return array.sort((a, b) => {
         if (a.name && a.name.formatted && b.name && b.name.formatted) {
            return a.name.formatted < b.name.formatted ? -1 : 1;
         } else if (a.name && a.name.formatted) {
            // keeps missing names at bottom of list
            return -1;
         } else if (b.name && b.name.formatted) {
            // keeps missing names at bottom of list
            return 1;
         }
      });
   }

   async presentToast(message, color) {
      const toast = await this.toastController.create({
         message: message,
         duration: 3000,
         color: color
      });
      toast.present();
   }

   sendProfileToNetwork() {
      this.sending = true;
      this.profileService.sendProfileToNetwork(() => {
         this.sending = false;
         this.presentToast('Profile Successfully Sent to Network!', 'success');
      }, () => {
         this.sending = false;
         this.presentToast('Send failed, try back later', 'danger');
      });
   }
}
