import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
   selector: 'app-contact-update',
   templateUrl: './contact-update.page.html',
   styleUrls: ['./contact-update.page.scss'],
})
export class ContactUpdatePage implements OnInit {

   @Input() userUuid: string;

   constructor(private activatedroute: ActivatedRoute,
      private router: Router, private modalController: ModalController) {
   }

   ngOnInit() {
      console.log('on init page1page');
      if (this.activatedroute.snapshot.queryParamMap.has('userUuid') === true) {
         this.userUuid = this.activatedroute.snapshot.queryParamMap.get('userUuid');
      }
      console.info('page1page: ' + this.userUuid);
   }

   onBack(): void {
      this.close();
   }

   close() {
      this.modalController.dismiss();
   }


}
