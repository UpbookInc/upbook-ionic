import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
   selector: 'app-contact-update',
   templateUrl: './contact-update.page.html',
   styleUrls: ['./contact-update.page.scss'],
})
export class ContactUpdatePage implements OnInit {

   contactUpdates;

   constructor(private modalController: ModalController, private navParams: NavParams) {
      console.log(navParams);
      //TODO: null checks
      this.contactUpdates = navParams.data.contactUpdates;
   }

   ngOnInit() {
      console.log('on init page1page');
   }

   onBack(): void {
      this.close();
   }

   close() {
      this.modalController.dismiss();
   }


}
