import { Injectable, NgZone } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController } from '@ionic/angular';
import { DebugService } from '../debug/debug.service';

@Injectable({
   providedIn: 'root'
})
export class DeeplinkService {

   constructor(protected deeplinks: Deeplinks, protected navController: NavController, private zone: NgZone,
      private debugService: DebugService) { }

   setupDeepLinkRouting() {
      // routeWithNavController still uses the old push/pop under the hood
      this.deeplinks.route({
         '/upbook/intent': 'contact-update'
      }).subscribe(match => {
         // match.$route - the route we matched, which is the matched entry from the arguments to route()
         // match.$args - the args passed in the link
         // match.$link - the full link data
         this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully matched route:");
         this.debugService.add(match);

         //TODO: need to decode data so that it's usable

         this.zone.run(async () => {
            // must run inside zone to avoid warning, some async issue
            //TODO: best way to translate this to an object? 
            await this.navController.navigateForward(match.$route + "?" + match.$link.queryString);

            this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully navigated to route.");
         });

      }, nomatch => {
         // nomatch.$link - the full link data
         console.error('Got a deeplink that didn\'t match', nomatch);
      });
   }
}
