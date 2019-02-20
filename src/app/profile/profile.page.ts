import { Component, OnInit } from '@angular/core';
import { ProfileService } from './service/profile.service';
import { FormsModule } from '@angular/forms';
import { AddressbookService } from '../addressbook/addressbook.service';
import { Profile } from './model/profile';

@Component({
   selector: 'app-profile',
   templateUrl: './profile.page.html',
   styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

   nextButtonNeeded: Boolean = false;
   profileComplete: Boolean = false;
   constructor(private profileService: ProfileService, private addressbookService: AddressbookService) { }

   ngOnInit() {
      this.performNecessaryStartupTasks();
   }

   private performNecessaryStartupTasks() {
      this.checkIsProfileSavedToUBDatabase();
      this.isNetworkBeenEstablished();
   }

   private isNetworkBeenEstablished() {
      this.addressbookService.getUBDatabaseOfContacts().then(result => {
         if (result == null || result == undefined) {
            this.nextButtonNeeded = true;
         } else {
            this.nextButtonNeeded = false;
         }
      });
   }

   private checkIsProfileSavedToUBDatabase() {
      this.profileService.isProfileSavedToUBDatabase().then(result => {
         if (result == null || result == undefined || result == '') {
            console.log("UB profile to be created");
            this.profileComplete = false;
         } else {
            //TODO: check for all required fields to be complete
            console.log("UB profile already exists");
            this.profileComplete = true;
         }
      });
   }
}
