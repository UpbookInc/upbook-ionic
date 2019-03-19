import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
   selector: 'app-contact-update',
   templateUrl: './contact-update.page.html',
   styleUrls: ['./contact-update.page.scss'],
})
export class ContactUpdatePage implements OnInit {

   contactUpdates;
   contactDeltas;
   updateNeeded;
   displayName;

   constructor(private modalController: ModalController, private navParams: NavParams) {
      //TODO: null checks
      this.updateNeeded = navParams.data.updateNeeded;
      this.displayName = this.contactUpdates = navParams.data._objectInstance.displayName;
      if (this.updateNeeded === true) {
         this.contactDeltas = navParams.data.deltas;
         this.contactUpdates = navParams.data._objectInstance;
      }
   }

   ngOnInit() {
      console.log('on init page1page');
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
