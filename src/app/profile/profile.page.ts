import { Component, OnInit } from '@angular/core';
import { ProfileService } from './service/profile.service';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { DebugService } from '../debug/debug.service';

@Component({
   selector: 'app-profile',
   templateUrl: './profile.page.html',
   styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

   nextButtonNeeded: Boolean = false;
   profileComplete: Boolean = false;
   constructor(private profileService: ProfileService, private networkStoreService: NetworkStoreService, private debugService: DebugService) { }

   ngOnInit() {
      this.debugService.add("ProfilePage.ngOnInit.");
      this.performNecessaryStartupTasks();
   }

   private performNecessaryStartupTasks() {
      this.checkIsProfileSavedToUBDatabase();
      this.isNetworkBeenEstablished();
   }

   private isNetworkBeenEstablished() {
      this.networkStoreService.getUBDatabaseOfContacts(result => {
         this.debugService.add("ProfilePage.isNetworkBeenEstablished.");
         if (result == null || result == undefined) {
            this.nextButtonNeeded = true;
         } else {
            this.nextButtonNeeded = false;
         }
         this.debugService.add("ProfilePage.isNetworkBeenEstablished, nextButtonNeeded: " + this.nextButtonNeeded);
      }, errorResults => {
         this.debugService.add("ProfilePage.isNetworkBeenEstablished.");
         this.debugService.add(errorResults);
      });
   }

   private checkIsProfileSavedToUBDatabase() {
      this.profileService.isProfileSavedToUBDatabase().then(result => {
         if (result == null || result == undefined || result == '') {
            this.debugService.add("ProfilePage.checkIsProfileSavedToUBDatabase UB profile to be created");
            this.profileComplete = false;
         } else {
            //TODO: check for all required fields to be complete
            this.debugService.add("ProfilePage.checkIsProfileSavedToUBDatabase UB profile already exists");
            this.profileComplete = true;
         }
      });
   }
}
