import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
   selector: 'app-contact-update',
   templateUrl: './contact-update.page.html',
   styleUrls: ['./contact-update.page.scss'],
})
export class ContactUpdatePage {

   contactUpdates;
   contactDeltas;
   updateNeeded;
   displayName;
   contact: any;

   constructor(private modalController: ModalController, private navParams: NavParams) {
      //TODO: null checks
      this.updateNeeded = navParams.data.updateNeeded;
      this.contact = {};
      if (navParams.data._objectInstance.name) {
         this.displayName = navParams.data._objectInstance.name.givenName + ' ' + navParams.data._objectInstance.name.familyName;
      } else if (navParams.data._objectInstance.displayName) {
         this.displayName = navParams.data._objectInstance.displayName;
      } else {
         this.displayName = "[missing name]"
      }

      this.contact = {
         name: this.displayName,
         phoneNumbers: navParams.data._objectInstance.phoneNumbers,
         emails: navParams.data._objectInstance.emails,         
         addresses: navParams.data._objectInstance.addresses,
         organizations: navParams.data._objectInstance.organizations
      };

      if (this.updateNeeded === true) {
         this.contactDeltas = navParams.data.deltas;
         this.contactUpdates = navParams.data._objectInstance;
      }
   }

   onBack(): void {
      this.close(false);
   }

   save(): void {
      this.close(true);
   }

   cancel(): void {
      this.close(false);
   }

   private close(isSave) {
      this.modalController.dismiss({ save: isSave });
   }


}
