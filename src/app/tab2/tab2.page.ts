import { Component, ViewChild } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { Platform, IonInfiniteScroll } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   searching: any = false;
   searchTerm: string = '';
   allContacts;
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
      private debugService: DebugService) {
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

      //resetup page count, etc with new data
      this.currentPage = 0;
      this.displayedContacts = [];
      this.initContactsTable(this.filteredContacts);
      this.loadContacts(this.filteredContacts);

      this.searching = false;
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

   private async checkIsUBNetworkDatabaseCreated() {
      try {
         const successResults = await this.networkStoreService.getUBDatabaseOfContacts();
         if (successResults == null || successResults == undefined) {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB Addressbook to be created.");
            this.networkStoreService.getAllAddressbookContactsFromDevice().then(deviceContacts => {
               this.allContacts = this.sortData(deviceContacts);
               this.initContactsTable(this.allContacts);
               this.loadContacts(this.allContacts, undefined);
               this.networkStoreService.saveContactsToStore(this.allContacts);
               this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: saved contacts to UB store.");
            });

         } else {
            this.debugService.add("Tab2Page.checkIsUBNetworkDatabaseCreated: UB addressbook database already exists.");

            this.allContacts = this.sortData(successResults);
            this.initContactsTable(successResults);
            this.loadContacts(this.allContacts, undefined);

            this.checkForMaximumSelectedNetworkContacts(true);
         }
      }
      catch (error) {
         return Promise.reject(undefined);
      }
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
         this.loadContacts(this.allContacts, infiniteScrollParam);
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
      return this.allContacts.filter(contact => contact.inNetwork).length;
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
