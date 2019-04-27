import { Component } from '@angular/core';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { ProfileService } from '../profile/service/profile.service';
import { ToastService } from '../toast/toast.service';

@Component({
   selector: 'app-tab-network',
   templateUrl: './tab-network.page.html',
   styleUrls: ['./tab-network.page.scss'],
})
export class TabNetworkPage {

   displayedContacts: any[];
   sending: boolean;

   constructor(private networkStoreService: NetworkStoreService, public toastService: ToastService,
      private profileService: ProfileService) { }

   sendProfileToNetwork() {
      this.sending = true;

      this.profileService.sendProfileToNetwork(() => {
         this.sending = false;
         this.toastService.presentToast('Profile Successfully Sent to Network!', 'success');
      }, () => {
         this.sending = false;
         this.toastService.presentToast('Send failed, try back later', 'danger');
      });
   }

   ionViewDidEnter() {
      this.loadInNetworkContacts();
   }

   async removeFromNetwork(contact) {
      contact.inNetwork = false;
      await this.networkStoreService.updateMultipleUBContacts([contact]);
      this.loadInNetworkContacts();
   }

   async loadInNetworkContacts() {
      this.displayedContacts = await this.networkStoreService.getUBSelectedNetworkContacts();
   }
}
