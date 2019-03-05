import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

   private allDebugOutput: String = "";
   constructor() { 

   }

   add(messageToAdd) {
      if (this.allDebugOutput != "") {
         this.allDebugOutput += "::::"
      }
      console.log(messageToAdd);
      this.allDebugOutput += messageToAdd;
   }

   get() {
      return this.allDebugOutput;
   }
}
