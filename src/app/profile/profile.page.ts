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
export class ProfilePage {

   @ViewChild(ProfileFormComponent)
   private profileFormComponent: ProfileFormComponent;

   networkEstablished: Boolean = false;
   profileComplete: Boolean = false;
   editMode = false;

   constructor(private profileService: ProfileService, private networkStoreService: NetworkStoreService, private debugService: DebugService) { }

   private async isNetworkBeenEstablished() {
      try {
         const result = await this.networkStoreService.getUBDatabaseOfContacts();
         this.debugService.add("ProfilePage.isNetworkBeenEstablished.");
         if (result == null || result == undefined) {
            this.networkEstablished = true;
         } else {
            this.networkEstablished = false;
         }
         this.debugService.add("ProfilePage.isNetworkBeenEstablished, nextButtonNeeded: " + this.networkEstablished);
      } catch (error) {
         this.debugService.add("ProfilePage.isNetworkBeenEstablished error:");
         this.debugService.add(error);
      }
   }

   private async checkIsProfileSavedToUBDatabase() {
      const result = await this.profileService.isProfileSavedToUBDatabase();
      if (result == null || result == undefined || result == '') {
         this.debugService.add("ProfilePage.checkIsProfileSavedToUBDatabase UB profile to be created");
         this.profileComplete = false;
         this.editMode = true;
      } else {
         //TODO: check for all required fields to be complete
         this.debugService.add("ProfilePage.checkIsProfileSavedToUBDatabase UB profile already exists");
         this.profileComplete = true;
      }
   }

   saveProfile() {
      this.editMode = false;
      this.profileFormComponent.onSubmit();
   }

   cancel() {
      this.editMode = false;
      this.profileFormComponent.cancel();
   }

   editProfile() {
      this.editMode = true;
      this.profileFormComponent.editProfile(true);
   }

   private performNecessaryStartupTasks() {
      this.checkIsProfileSavedToUBDatabase();
      this.isNetworkBeenEstablished();
      this.editMode = false;
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

}
