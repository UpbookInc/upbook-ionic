import { Component, ViewChild } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { Platform, IonInfiniteScroll } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';
import { ContactsService } from '../contacts/contacts.service';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   searching: any = false;
   searchTerm: string = '';
   allUBContacts;
   displayedContacts = [];
   filteredContacts = [];
   isNetworkSelectionDisabled: boolean = false;
   MAX_IN_NETWORK_CONTACTS_SELECTED = 4;
   selectedNetworkSize: any = 0;
   currentPage = 0;
   pageCount = 1;
   CONTACTS_PER_PAGE = 50;

   @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

   constructor(private networkStoreService: NetworkStoreService, private platform: Platform,
      private debugService: DebugService, private contactService: ContactsService) {
   }

   setFilteredItems(reset) {
      this.searching = true;
      if (reset === true) {
         this.searchTerm = '';
      }

      this.filteredContacts = this.allUBContacts.filter((item) => {
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

      //resetup page count, etc with new data
      this.currentPage = 0;
      this.displayedContacts = [];
      this.initContactsTable(this.filteredContacts);
      this.loadContacts(this.filteredContacts);

      this.searching = false;
   }

   clearNetworkSelections() {
      let contactsToUpdate: Array<Contact> = [];
      this.allUBContacts.map(contact => {
         if (contact.inNetwork === true) {
            contact.inNetwork = false;
            contactsToUpdate.push(contact)
         }
      });
      this.networkStoreService.updateMultipleUBContacts(contactsToUpdate);
      this.selectedNetworkSize = this.getSelectedNetworkSize();
      this.checkForMaximumSelectedNetworkContacts(true);
   }

   private async checkIsUBNetworkDatabaseCreated() {
      try {
         const ubContacts = await this.networkStoreService.getUBDatabaseOfContacts();

         if (ubContacts == null || ubContacts == undefined) {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB Addressbook to be created.");
            this.networkStoreService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.allUBContacts = this.sortData(deviceContacts);
               this.initContactsTable(this.allUBContacts);
               this.loadContacts(this.allUBContacts, undefined);
               this.networkStoreService.saveContactsToStore(this.allUBContacts);
               this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: saved contacts to UB store.");
            });
         } else {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB addressbook database already exists.");

            this.allUBContacts = await this.importNewContactsFromDeviceToUb(ubContacts);
            this.allUBContacts = this.sortData(this.allUBContacts);
            this.initContactsTable(ubContacts);
            this.loadContacts(this.allUBContacts, undefined);
            this.checkForMaximumSelectedNetworkContacts(true);
         }
      } catch (error) {
         return Promise.reject(undefined);
      }
   }

   private async importNewContactsFromDeviceToUb(currentUbNetwork) {
      let updateNeeded = false;
      let deviceContacts = await this.contactService.queryAllDeviceContacts();

      // preserve in network selections by adding/removing to currentUbNetwork
      let missingDeviceContacts = this.getArrayItemsNotInSecondArray(deviceContacts, currentUbNetwork, 'id');
      if (missingDeviceContacts && missingDeviceContacts.length > 0) {
         missingDeviceContacts.map(missingDevCont => currentUbNetwork.push(missingDevCont));
         updateNeeded = true;
      }

      let extraneousUBContacts = this.getArrayItemsNotInSecondArray(currentUbNetwork, deviceContacts, 'id');
      if (extraneousUBContacts && extraneousUBContacts.length > 0) {
         let extraneousFilteredUbNetwork = currentUbNetwork.filter(contact => {
            return extraneousUBContacts.find(extraContact => extraContact.id != contact.id);
         });
         if (extraneousFilteredUbNetwork && extraneousFilteredUbNetwork.length > 0) {
            currentUbNetwork = extraneousFilteredUbNetwork;
            updateNeeded = true;
         }
      }

      if (updateNeeded === true) {
         this.networkStoreService.saveContactsToStore(currentUbNetwork);
         return await this.networkStoreService.getUBDatabaseOfContacts();
      }

      return currentUbNetwork;
   }

   private getArrayItemsNotInSecondArray(firstArray, secondArray, fieldCheckName: string = 'value') {
      return firstArray.filter(firstArrayItem => {
         if (firstArrayItem && firstArrayItem[fieldCheckName]) {
            return secondArray.map(secondArrayItem => secondArrayItem[fieldCheckName]).indexOf(firstArrayItem[fieldCheckName]) === -1
         }
         return false;
      })
   }

   loadContacts(subjectContactData, infiniteScrollParam?) {
      let startIndex = this.currentPage * this.CONTACTS_PER_PAGE;
      let endIndex = startIndex + this.CONTACTS_PER_PAGE;

      this.displayedContacts = this.displayedContacts.concat(
         subjectContactData.slice(startIndex, endIndex));

      if (infiniteScrollParam) {
         infiniteScrollParam.target.complete();
      }

      if (this.currentPage === (this.pageCount - 1)) {
         if (this.infiniteScroll) {
            this.infiniteScroll.disabled = true;
         }
      } else {
         this.currentPage++;
         if (this.infiniteScroll) {
            this.infiniteScroll.disabled = false;
         }
      }
   }

   loadMoreContacts(infiniteScrollParam?) {
      if (this.searchTerm && this.searchTerm != '') {
         this.loadContacts(this.filteredContacts, infiniteScrollParam);
      } else {
         this.loadContacts(this.allUBContacts, infiniteScrollParam);
      }
   }

   ionViewDidEnter() {
      this.platform.ready().then((readySource) => {
         this.displayedContacts = [];
         this.filteredContacts = [];
         this.searchTerm = '';
         this.searching = false;
         this.currentPage = 0;
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      this.checkForMaximumSelectedNetworkContacts(contactToToggleForNetwork.inNetwork);
      this.networkStoreService.updateMultipleUBContacts([contactToToggleForNetwork]);
   }

   checkForMaximumSelectedNetworkContacts(isContactSelected) {
      this.selectedNetworkSize = this.getSelectedNetworkSize();
      this.isNetworkSelectionDisabled = this.networkStoreService.isMaximumNetworkContactsSelected(isContactSelected,
         this.selectedNetworkSize, this.MAX_IN_NETWORK_CONTACTS_SELECTED);
   }

   private initContactsTable(rawData) {
      let deviceContactsLength = rawData.length;
      let rawPageCount = deviceContactsLength / this.CONTACTS_PER_PAGE;
      this.pageCount = Math.ceil(rawPageCount);
   }

   getSelectedNetworkSize() {
      return this.allUBContacts.filter(contact => contact.inNetwork).length;
   }

   sortData(array: Array<Contact>): Array<Contact> {
      return array.sort((a, b) => {
         if (a.name && a.name.givenName && b.name && b.name.givenName) {
            return a.name.givenName.toLowerCase() < b.name.givenName.toLowerCase() ? -1 : 1;
         } else if (a.name && a.name.givenName) {
            // keeps missing names at bottom of list
            return -1;
         } else if (b.name && b.name.givenName) {
            // keeps missing names at bottom of list
            return 1;
         }
      });
   }
}
