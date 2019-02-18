
## Troubleshooting  

#### Android  

- In an attempt to make sure the AndroidManaifest.xml file is correct, it will be tracked under platform-configs.  
- After a fresh android platform install, may have to run the following:  
    > chmod +x platforms/android/gradlew  
    > chmod +x /Applications/Android\ Studio.app/Contents/gradle/gradle-4.10.1/bin/gradle
- If launching app for android sim doesn't work, try a cold boot from the AVD Device manager.  

##### Deeplink intent configs in AndroidManifest  
- To get the "App Link Assistant" menu to show, in Android Studio: File->Sync Project with Gradle Files  
- Intent filters may be tricky to get working.  Android Studio may want to "refactor", it then bugs out and puts a ton of unncessary intents.  Remove those.  The URL Map editor inside App Link Assistant may help.  Then once you've got it looking good, restart the android app run command: `ionic cordova run android -l`.   
- The Ionic configs to set deeplink intents doesn't support `pathPattern` as far as I can tell, so we have to manually add to AndroidManifest.  See below or check the AndroidManifest file we track under platform-configs.  


```
//Android: working intent filter for AndroidManifest.xml  

<intent-filter android:autoVerify="true">
   <action android:name="android.intent.action.VIEW" />

   <category android:name="android.intent.category.DEFAULT" />
   <category android:name="android.intent.category.BROWSABLE" />

   <data
      android:host="fractalstack.com"
      android:scheme="https"
      android:pathPattern="/upbook/.*" />
</intent-filter>  
```  

#### iOS

- there was a major update in FEB2019 on cordova-ios, so use `cordova platform add ios@5.0.0` to make sure to grab the latest.  

