import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
   selector: 'app-contact-update',
   templateUrl: './contact-update.page.html',
   styleUrls: ['./contact-update.page.scss'],
})
export class ContactUpdatePage implements OnInit {

   userUuid;

   constructor(private activatedroute: ActivatedRoute,
      private router: Router) {
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
      this.router.navigate(['/profile']);
   }


}