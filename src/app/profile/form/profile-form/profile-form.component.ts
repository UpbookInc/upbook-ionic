import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { Profile } from '../../model/profile';

@Component({
   selector: 'app-profile-form',
   templateUrl: './profile-form.component.html',
   styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

   private profile: Profile = new Profile();
   constructor(private profileService: ProfileService) { }

   ngOnInit() {
      console.log("getting personal profile from store");
      this.profileService.getPersonalProfile().then(profileResponse => {
         if (profileResponse != null && profileResponse != undefined && profileResponse != '') {
            this.profile = profileResponse;
            console.log("personal profile from UB store")
            console.log(this.profile);
         } else {
            console.log("profile is empty");
         }
      });
   }

   onSubmit() {
      console.log("Submitted");
      console.log("Saved personal profile: ");
      console.log(this.profile);
      this.profileService.saveProfileToUBDatabase(this.profile)
   }

}
