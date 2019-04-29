import { Component, ViewChild } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { Platform, IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';
import { ContactsService } from '../contacts/contacts.service';
import { ToastService } from '../toast/toast.service';
import { MultiAttrPage } from '../multi-attr/multi-attr.page';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   searching: any = false;
   searchTerm: string = '';
   allDeviceContacts;
   displayedContacts = [];
   filteredContacts = [];
   isNetworkSelectionDisabled: boolean = false;
   MAX_IN_NETWORK_CONTACTS_SELECTED = 4;
   currentPage = 0;
   pageCount = 1;
   CONTACTS_PER_PAGE = 50;

   @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

   constructor(private networkStoreService: NetworkStoreService, private platform: Platform,
      private debugService: DebugService, private contactService: ContactsService, public toastService: ToastService,
      private modalController: ModalController) {
   }

   private async checkIsUBNetworkDatabaseCreated() {
      this.searching = true;
      try {
         const ubContacts = await this.networkStoreService.getUBDatabaseOfContacts();
         let deviceContacts = await this.networkStoreService.getAllAddressbookContactsFromDevice();

         this.allDeviceContacts = this.sortData(deviceContacts);
         this.networkStoreService.flagDeviceContactsInNetwork(ubContacts);

         this.initContactsTable(this.allDeviceContacts);
         this.loadContacts(this.allDeviceContacts, undefined);
         this.checkForMaximumSelectedNetworkContacts(ubContacts);
         this.searching = false;
      } catch (error) {
         this.searching = false;
         return Promise.reject(undefined);
      }
   }

   // saves only in-network contacts to UB store
   async saveContactToNetwork(contactToToggleForNetwork: Contact) {
      let ubContacts = await this.networkStoreService.getUBDatabaseOfContacts();
      if (!ubContacts) {
         ubContacts = [];
      }

      // don't save if contact doesn't have number
      if (contactToToggleForNetwork && contactToToggleForNetwork.phoneNumbers
         && contactToToggleForNetwork.phoneNumbers.length > 0 && contactToToggleForNetwork.phoneNumbers[0].value) {

         if (contactToToggleForNetwork.phoneNumbers.length > 1) {
            const selectedPhoneNumber = await this.showMultiPhoneSelectionModal(contactToToggleForNetwork.name, contactToToggleForNetwork.phoneNumbers);
            contactToToggleForNetwork.contactNumber = selectedPhoneNumber;
         } else {
            contactToToggleForNetwork.contactNumber = contactToToggleForNetwork.phoneNumbers[0];
         }

         ubContacts.push(contactToToggleForNetwork);
         this.checkForMaximumSelectedNetworkContacts(ubContacts);
         this.networkStoreService.saveContactsToStore(ubContacts);
         this.networkStoreService.flagDeviceContactsInNetwork(ubContacts);
      } else {
         this.toastService.presentToast("Contact does not have a phone number!", 'danger');
      }
   }

   async showMultiPhoneSelectionModal(name, phoneNumbers) {
      const multiAttrProps = {
         multiAttrSelectMessage: 'Select phone number for sending updates',
         multiAttrName: 'phoneNumbers',
         multiAttr: phoneNumbers,
         multiAttrValueName: 'value',
         subjectName: name
      };

      return this.modalController.create({
         component: MultiAttrPage,
         componentProps: multiAttrProps
      }).then((modal) => {
         modal.present();
         this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully navigated to route.");

         return modal.onDidDismiss().then(data => {
            if (data.data.selectedAttr) {
               return data.data.selectedAttr;
            }
         });
      });
   }

   async checkForMaximumSelectedNetworkContacts(ubContacts) {
      if (ubContacts && ubContacts.length > 0) {
         this.isNetworkSelectionDisabled
            = this.networkStoreService.isMaximumNetworkContactsSelected(ubContacts.length, this.MAX_IN_NETWORK_CONTACTS_SELECTED);
      } else {
         this.isNetworkSelectionDisabled = false;
      }
   }

   setFilteredItems(reset) {
      this.searching = true;
      if (reset === true) {
         this.searchTerm = '';
      }

      this.filteredContacts = this.allDeviceContacts.filter((item) => {
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
         this.loadContacts(this.allDeviceContacts, infiniteScrollParam);
      }
   }

   ionViewDidEnter() {
      this.platform.ready().then(() => {
         this.displayedContacts = [];
         this.filteredContacts = [];
         this.searchTerm = '';
         this.searching = false;
         this.currentPage = 0;
         this.checkIsUBNetworkDatabaseCreated();
      });
   }

   private initContactsTable(rawData) {
      let deviceContactsLength = rawData.length;
      let rawPageCount = deviceContactsLength / this.CONTACTS_PER_PAGE;
      this.pageCount = Math.ceil(rawPageCount);
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
