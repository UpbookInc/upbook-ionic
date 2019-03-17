import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
   selector: 'app-page1',
   templateUrl: './page1.page.html',
   styleUrls: ['./page1.page.scss'],
})
export class Page1Page implements OnInit {

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
