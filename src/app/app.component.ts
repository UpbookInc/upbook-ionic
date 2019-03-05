import { Component, NgZone } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Storage } from '@ionic/storage';

@Component({
   selector: 'app-root',
   templateUrl: 'app.component.html'
})
export class AppComponent {

   constructor(
      private platform: Platform,
      private splashScreen: SplashScreen,
      private statusBar: StatusBar,
      protected deeplinks: Deeplinks,
      protected navController: NavController,
      private zone: NgZone,
      private storage: Storage
   ) {
      this.initializeApp();
   }

   initializeApp() {
      this.platform.ready().then(() => {
         this.statusBar.styleDefault();
         this.splashScreen.hide();
        
         // routeWithNavController still uses the old push/pop under the hood
         this.deeplinks.route({
            '/upbook/intent': 'page1'
         }).subscribe(match => {
            // match.$route - the route we matched, which is the matched entry from the arguments to route()
            // match.$args - the args passed in the link
            // match.$link - the full link data
            console.log('Successfully matched route', match);
            this.zone.run(async () => {
               // must run inside zone to avoid warning, some async issue
               //TODO: best way to translate this to an object? 
               await this.navController.navigateForward(match.$route + "?" + match.$link.queryString);

               console.log('Successfully navigated to route', match);
            });

         }, nomatch => {
            // nomatch.$link - the full link data
            console.error('Got a deeplink that didn\'t match', nomatch);
         });
      });
   }
}
