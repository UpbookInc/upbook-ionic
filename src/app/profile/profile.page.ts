import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from './service/profile.service';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { DebugService } from '../debug/debug.service';
import { ProfileFormComponent } from './form/profile-form/profile-form.component';

@Component({
   selector: 'app-profile',
   templateUrl: './profile.page.html',
   styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

   @ViewChild(ProfileFormComponent)
   private profileFormComponent: ProfileFormComponent;

   networkEstablished: Boolean = false;
   profileComplete: Boolean = false;
   constructor(private profileService: ProfileService, private networkStoreService: NetworkStoreService, private debugService: DebugService) { }

   private performNecessaryStartupTasks() {
      this.checkIsProfileSavedToUBDatabase();
      this.isNetworkBeenEstablished();
   }

   // called when profile form save is clicked
   eventFromChild() {
      this.debugService.add("ProfilePage.eventFromChild.");
      this.performNecessaryStartupTasks();
   }

   // called everytime this tab view becomes active
   // also calls the child form component to setup the form
   ionViewDidEnter() {
      this.performNecessaryStartupTasks();
      this.profileFormComponent.getPersonalProfile();
   }

   private isNetworkBeenEstablished() {
      this.networkStoreService.getUBDatabaseOfContacts(result => {
         this.debugService.add("ProfilePage.isNetworkBeenEstablished.");
         if (result == null || result == undefined) {
            this.networkEstablished = true;
         } else {
            this.networkEstablished = false;
         }
         this.debugService.add("ProfilePage.isNetworkBeenEstablished, nextButtonNeeded: " + this.networkEstablished);
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

   ngOnInit() { }
}
