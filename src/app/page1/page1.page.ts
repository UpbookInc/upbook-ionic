import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
   selector: 'app-page1',
   templateUrl: './page1.page.html',
   styleUrls: ['./page1.page.scss'],
})
export class Page1Page implements OnInit {

   userUuid;

   constructor(private _Activatedroute:ActivatedRoute,
      private _router: Router) {
   }

   ngOnInit() {
      console.log('on init page1page');
      if (this._Activatedroute.snapshot.queryParamMap.has('userUuid') === true) {
         this.userUuid = this._Activatedroute.snapshot.queryParamMap.get('userUuid');
      }
      console.info('page1page: ' + this.userUuid);
   }

   onBack(): void {
      this._router.navigate(['app-tab1']);
   }

}
