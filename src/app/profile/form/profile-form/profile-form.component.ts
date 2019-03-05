import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { Profile } from '../../model/profile';
import { DebugService } from 'src/app/debug/debug.service';

@Component({
   selector: 'app-profile-form',
   templateUrl: './profile-form.component.html',
   styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

   profile: Profile = new Profile();
   constructor(private profileService: ProfileService, private debugService: DebugService) { }

   ngOnInit() {
      this.debugService.add("ProfileFormComponent.ngOnInit: getting personal profile from store.");

      this.profileService.getPersonalProfile().then(profileResponse => {
         if (profileResponse != null && profileResponse != undefined && profileResponse != '') {
            this.profile = profileResponse;
            this.debugService.add("ProfileFormComponent: personal profile from UB store.");
            this.debugService.add(JSON.stringify(this.profile));
         } else {
            this.debugService.add("ProfileFormComponent.ngOnInit: profile is empty.");
         }
      });
   }

   onSubmit() {
      this.debugService.add("ProfileFormComponent.onSubmit: Submitted, Saved personal profile.");
      this.debugService.add(JSON.stringify(this.profile));
      this.profileService.saveProfileToUBDatabase(this.profile)
   }

}
